use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api, caller, query, update, init, pre_upgrade, post_upgrade};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap, Storable,
    storable::Bound,
};
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::HashMap;

impl Storable for DiscussionResponse {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Transaction {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

use serde::Serialize;

// Memory management
type Memory = VirtualMemory<DefaultMemoryImpl>;
type IdCell = ic_stable_structures::cell::Cell<u64, Memory>;

// Storage for different data types
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    static ID_COUNTER: RefCell<IdCell> = RefCell::new(
        IdCell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))), 0)
            .expect("Cannot create a counter")
    );

    static USERS: RefCell<StableBTreeMap<Principal, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static COURSES: RefCell<StableBTreeMap<u64, Course, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2))),
        )
    );

    static ENROLLMENTS: RefCell<StableBTreeMap<(Principal, u64), Enrollment, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static DISCUSSIONS: RefCell<StableBTreeMap<u64, Discussion, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4))),
        )
    );

    static TRANSACTIONS: RefCell<StableBTreeMap<u64, Transaction, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
        )
    );

    static ADMINS: RefCell<Vec<Principal>> = RefCell::new(Vec::new());
}

// Data structures
#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum UserRole {
    Learner,
    Educator,
    PendingEducator,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct User {
    pub principal: Principal,
    pub username: String,
    pub role: UserRole,
    pub reputation_score: u32,
    pub completed_courses: Vec<u64>,
    pub created_at: u64,
    pub token_balance: u64,
    pub active: bool,
    // Profile fields
    pub bio: Option<String>,
    pub location: Option<String>,
    pub website: Option<String>,
    pub interests: Vec<String>,
    pub avatar_url: Option<String>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum CourseStatus {
    Draft,
    Published,
    Archived,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Course {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub content_link: String,
    pub price: u64,
    pub educator: Principal,
    pub created_at: u64,
    pub enrolled_count: u32,
    pub category: String,
    pub status: CourseStatus,
    pub featured: bool,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Enrollment {
    pub learner: Principal,
    pub course_id: u64,
    pub enrolled_at: u64,
    pub completed: bool,
    pub progress: u8, // 0-100
    pub completed_at: Option<u64>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Discussion {
    pub id: u64,
    pub course_id: u64,
    pub author: Principal,
    pub title: String,
    pub content: String,
    pub created_at: u64,
    pub upvotes: Vec<Principal>,
    pub responses: Vec<DiscussionResponse>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct DiscussionResponse {
    pub id: u64,
    pub author: Principal,
    pub content: String,
    pub created_at: u64,
    pub upvotes: Vec<Principal>,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub enum TransactionType {
    CoursePayment,
    TokenTransfer,
    Reward,
    CourseSale,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct Transaction {
    pub id: u64,
    pub from_user: Principal,
    pub to_user: Principal,
    pub amount: u64,
    pub transaction_type: TransactionType,
    pub description: String,
    pub timestamp: u64,
    pub status: String,
}

// Error types
#[derive(CandidType, Deserialize)]
pub enum ScholarError {
    UserNotFound,
    CourseNotFound,
    InsufficientFunds,
    Unauthorized,
    AlreadyEnrolled,
    InvalidInput,
    NotEnrolled,
    UserAlreadyExists,
    UsernameAlreadyTaken,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UserProfile {
    pub bio: Option<String>,
    pub location: Option<String>,
    pub website: Option<String>,
    pub interests: Vec<String>,
    pub avatar_url: Option<String>,
}

type ScholarResult<T> = Result<T, ScholarError>;

// Storable implementations
impl Storable for User {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Course {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Enrollment {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Storable for Discussion {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(serde_json::to_vec(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        serde_json::from_slice(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Helper functions
fn get_time() -> u64 {
    api::time()
}

fn generate_id() -> u64 {
    ID_COUNTER.with(|counter| {
        let binding = counter.borrow();
        let current = binding.get();
        let next = current + 1;
        drop(binding);
        counter.borrow_mut().set(next).expect("Cannot increment counter");
        next
    })
}

fn get_next_id() -> u64 {
    generate_id()
}

fn is_admin(principal: &Principal) -> bool {
    ADMINS.with(|admins| admins.borrow().contains(principal))
}

// Initialization
#[init]
fn init() {
    // Set caller as the first admin
    let caller = caller();
    ADMINS.with(|admins| {
        admins.borrow_mut().push(caller);
    });
}

// User Management Functions
#[update]
fn register_user(username: String, role: UserRole) -> ScholarResult<User> {
    let caller = caller();
    
    // Check if user already exists
    if USERS.with(|users| users.borrow().contains_key(&caller)) {
        return Err(ScholarError::UserAlreadyExists);
    }

    // Check if username is already taken
    let username_taken = USERS.with(|users| {
        users.borrow().iter().any(|(_, user)| user.username == username)
    });
    
    if username_taken {
        return Err(ScholarError::UsernameAlreadyTaken);
    }

    let adjusted_role = match role {
        UserRole::Educator => UserRole::PendingEducator,
        _ => role,
    };

    let user = User {
        principal: caller,
        username,
        role: adjusted_role,
        reputation_score: 0,
        completed_courses: Vec::new(),
        created_at: get_time(),
        token_balance: 100, // Give 100 initial tokens
        active: true,
        bio: None,
        location: None,
        website: None,
        interests: Vec::new(),
        avatar_url: None,
    };

    USERS.with(|users| users.borrow_mut().insert(caller, user.clone()));
    
    Ok(user)
}

#[query]
fn get_user(principal: Principal) -> ScholarResult<User> {
    USERS.with(|users| {
        users.borrow().get(&principal).ok_or(ScholarError::UserNotFound)
    })
}

#[query]
fn get_current_user() -> ScholarResult<User> {
    let caller = caller();
    get_user(caller)
}

// Profile Management Functions
#[update]
fn update_user_profile(profile: UserProfile) -> ScholarResult<User> {
    let caller = caller();
    
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&caller) {
            user.bio = profile.bio;
            user.location = profile.location;
            user.website = profile.website;
            user.interests = profile.interests;
            user.avatar_url = profile.avatar_url;
            
            users_map.insert(caller, user.clone());
            Ok(user)
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

#[query]
fn get_user_profile(principal: Principal) -> ScholarResult<User> {
    get_user(principal)
}

#[query]
fn get_user_courses(principal: Principal) -> Vec<Course> {
    let user_courses = ENROLLMENTS.with(|enrollments| {
        enrollments
            .borrow()
            .iter()
            .filter(|((user_principal, _), _)| *user_principal == principal)
            .map(|((_, course_id), _)| course_id)
            .collect::<Vec<u64>>()
    });

    COURSES.with(|courses| {
        user_courses
            .iter()
            .filter_map(|&course_id| courses.borrow().get(&course_id))
            .collect()
    })
}

#[query]
fn get_courses_by_creator(educator: Principal) -> Vec<Course> {
    COURSES.with(|courses| {
        courses
            .borrow()
            .iter()
            .filter(|(_, course)| course.educator == educator)
            .map(|(_, course)| course)
            .collect()
    })
}

#[query]
fn get_user_reputation_history(principal: Principal) -> Vec<(String, i32, u64)> {
    // For now, return a simple reputation history
    // In a full implementation, you'd have a separate reputation_history storage
    vec![
        ("Course Completion".to_string(), 50, get_time() - 86400),
        ("Discussion Participation".to_string(), 25, get_time() - 172800),
        ("Course Creation".to_string(), 100, get_time() - 259200),
    ]
}

#[update]
fn approve_educator(educator_principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&educator_principal) {
            if matches!(user.role, UserRole::PendingEducator) {
                user.role = UserRole::Educator;
                users_map.insert(educator_principal, user);
                Ok(())
            } else {
                Err(ScholarError::InvalidInput)
            }
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

// Course Management Functions
#[update]
fn create_course(
    title: String,
    description: String,
    content_link: String,
    price: u64,
    category: String,
) -> ScholarResult<Course> {
    let caller = caller();
    
    // Check if user is an approved educator
    let user = get_user(caller)?;
    if !matches!(user.role, UserRole::Educator) {
        return Err(ScholarError::Unauthorized);
    }

    let course_id = generate_id();
    let course = Course {
        id: course_id,
        title,
        description,
        content_link,
        price,
        educator: caller,
        created_at: get_time(),
        enrolled_count: 0,
        category,
        status: CourseStatus::Draft,
        featured: false,
    };

    COURSES.with(|courses| courses.borrow_mut().insert(course_id, course.clone()));
    Ok(course)
}

#[query]
fn get_courses() -> Vec<Course> {
    COURSES.with(|courses| {
        courses.borrow().iter().map(|(_, course)| course).collect()
    })
}

#[query]
fn get_course(course_id: u64) -> ScholarResult<Course> {
    COURSES.with(|courses| {
        courses.borrow().get(&course_id).ok_or(ScholarError::CourseNotFound)
    })
}

#[query]
fn get_courses_by_educator(educator: Principal) -> Vec<Course> {
    COURSES.with(|courses| {
        courses
            .borrow()
            .iter()
            .filter(|(_, course)| course.educator == educator)
            .map(|(_, course)| course)
            .collect()
    })
}

// Enrollment Functions
#[update]
fn enroll_in_course(course_id: u64) -> ScholarResult<Enrollment> {
    let caller = caller();
    
    // Check if course exists
    let course = get_course(course_id)?;
    
    // Check if user exists and is a learner
    let user = get_user(caller)?;
    if !matches!(user.role, UserRole::Learner) {
        return Err(ScholarError::Unauthorized);
    }

    // Check if already enrolled
    let enrollment_key = (caller, course_id);
    if ENROLLMENTS.with(|enrollments| enrollments.borrow().contains_key(&enrollment_key)) {
        return Err(ScholarError::AlreadyEnrolled);
    }

    // Check balance and transfer tokens
    let balance = get_user_balance(caller);
    if balance < course.price {
        return Err(ScholarError::InsufficientFunds);
    }

    // Transfer tokens from learner to educator
    transfer_tokens_internal(caller, course.educator, course.price)?;

    // Create enrollment
    let enrollment = Enrollment {
        learner: caller,
        course_id,
        enrolled_at: get_time(),
        completed: false,
        progress: 0,
        completed_at: None,
    };

    ENROLLMENTS.with(|enrollments| {
        enrollments.borrow_mut().insert(enrollment_key, enrollment.clone())
    });

    // Update course enrollment count
    COURSES.with(|courses| {
        let mut courses_map = courses.borrow_mut();
        if let Some(mut updated_course) = courses_map.get(&course_id) {
            updated_course.enrolled_count += 1;
            courses_map.insert(course_id, updated_course);
        }
    });

    Ok(enrollment)
}

#[update]
fn update_progress(course_id: u64, progress: u8) -> ScholarResult<()> {
    let caller = caller();
    let enrollment_key = (caller, course_id);
    
    ENROLLMENTS.with(|enrollments| {
        let mut enrollments_map = enrollments.borrow_mut();
        if let Some(mut enrollment) = enrollments_map.get(&enrollment_key) {
            enrollment.progress = progress.min(100);
            
            // If course is completed (100% progress), award completion tokens
            if progress >= 100 && !enrollment.completed {
                enrollment.completed = true;
                enrollment.completed_at = Some(get_time());
                
                // Update user's completed courses and award completion bonus (500 tokens)
                USERS.with(|users| {
                    let mut users_map = users.borrow_mut();
                    if let Some(mut user) = users_map.get(&caller) {
                        user.completed_courses.push(course_id);
                        user.reputation_score += 10;
                        user.token_balance += 500; // Award completion bonus
                        users_map.insert(caller, user);
                    }
                });
            }
            
            enrollments_map.insert(enrollment_key, enrollment);
            Ok(())
        } else {
            Err(ScholarError::NotEnrolled)
        }
    })
}

#[query]
fn get_enrollments(learner: Principal) -> Vec<Enrollment> {
    ENROLLMENTS.with(|enrollments| {
        enrollments
            .borrow()
            .iter()
            .filter(|((principal, _), _)| *principal == learner)
            .map(|(_, enrollment)| enrollment)
            .collect()
    })
}

// Token Management Functions
#[query]
fn get_user_balance(principal: Principal) -> u64 {
    USERS.with(|users| {
        users
            .borrow()
            .get(&principal)
            .map(|user| user.token_balance)
            .unwrap_or(0)
    })
}

#[update]
fn transfer_tokens(to: Principal, amount: u64) -> ScholarResult<()> {
    let caller = caller();
    transfer_tokens_internal(caller, to, amount)
}

#[query]
fn get_user_transactions(principal: Principal) -> Vec<Transaction> {
    TRANSACTIONS.with(|transactions| {
        transactions
            .borrow()
            .iter()
            .filter(|(_, tx)| tx.from_user == principal || tx.to_user == principal)
            .map(|(_, tx)| tx)
            .collect()
    })
}

#[query]
fn get_recent_transactions() -> Vec<Transaction> {
    TRANSACTIONS.with(|transactions| {
        let mut all_txs: Vec<Transaction> = transactions
            .borrow()
            .iter()
            .map(|(_, tx)| tx)
            .collect();
        
        all_txs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        all_txs.into_iter().take(50).collect()
    })
}

fn transfer_tokens_internal(from: Principal, to: Principal, amount: u64) -> ScholarResult<()> {
    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        
        // Get from user
        let mut from_user = users_map.get(&from).ok_or(ScholarError::UserNotFound)?;
        if from_user.token_balance < amount {
            return Err(ScholarError::InsufficientFunds);
        }

        // Get to user  
        let mut to_user = users_map.get(&to).ok_or(ScholarError::UserNotFound)?;
        
        // Update balances
        from_user.token_balance -= amount;
        to_user.token_balance += amount;
        
        // Save updated users
        users_map.insert(from, from_user);
        users_map.insert(to, to_user);
        
        Ok(())
    })?;

    // Record transaction
    record_transaction(from, to, amount, TransactionType::TokenTransfer, "Token Transfer".to_string());
    
    Ok(())
}

fn record_transaction(from: Principal, to: Principal, amount: u64, tx_type: TransactionType, description: String) {
    let transaction_id = get_next_id();
    let transaction = Transaction {
        id: transaction_id,
        from_user: from,
        to_user: to,
        amount,
        transaction_type: tx_type,
        description,
        timestamp: get_time(),
        status: "Completed".to_string(),
    };

    TRANSACTIONS.with(|transactions| {
        transactions.borrow_mut().insert(transaction_id, transaction);
    });
}

// Discussion Functions
#[update]
fn create_discussion(course_id: u64, title: String, content: String) -> ScholarResult<Discussion> {
    let caller = caller();
    
    // Check if user is enrolled in the course or is the educator
    let course = get_course(course_id)?;
    let enrollment_key = (caller, course_id);
    let is_enrolled = ENROLLMENTS.with(|enrollments| {
        enrollments.borrow().contains_key(&enrollment_key)
    });
    
    if !is_enrolled && caller != course.educator {
        return Err(ScholarError::Unauthorized);
    }

    let discussion_id = generate_id();
    let discussion = Discussion {
        id: discussion_id,
        course_id,
        author: caller,
        title,
        content,
        created_at: get_time(),
        upvotes: Vec::new(),
        responses: Vec::new(),
    };

    DISCUSSIONS.with(|discussions| {
        discussions.borrow_mut().insert(discussion_id, discussion.clone())
    });

    Ok(discussion)
}

#[update]
fn add_discussion_response(discussion_id: u64, content: String) -> ScholarResult<()> {
    let caller = caller();
    
    DISCUSSIONS.with(|discussions| {
        let mut discussions_map = discussions.borrow_mut();
        if let Some(mut discussion) = discussions_map.get(&discussion_id) {
            // Check if user is enrolled in the course or is the educator
            let course = get_course(discussion.course_id)?;
            let enrollment_key = (caller, discussion.course_id);
            let is_enrolled = ENROLLMENTS.with(|enrollments| {
                enrollments.borrow().contains_key(&enrollment_key)
            });
            
            if !is_enrolled && caller != course.educator {
                return Err(ScholarError::Unauthorized);
            }

            let response_id = generate_id();
            let response = DiscussionResponse {
                id: response_id,
                author: caller,
                content,
                created_at: get_time(),
                upvotes: Vec::new(),
            };

            discussion.responses.push(response);
            discussions_map.insert(discussion_id, discussion);
            Ok(())
        } else {
            Err(ScholarError::InvalidInput)
        }
    })
}

#[update]
fn upvote_discussion(discussion_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    DISCUSSIONS.with(|discussions| {
        let mut discussions_map = discussions.borrow_mut();
        if let Some(mut discussion) = discussions_map.get(&discussion_id) {
            if !discussion.upvotes.contains(&caller) {
                discussion.upvotes.push(caller);
                
                // Award tokens and reputation to the discussion author (10 tokens per upvote)
                USERS.with(|users| {
                    let mut users_map = users.borrow_mut();
                    if let Some(mut user) = users_map.get(&discussion.author) {
                        user.token_balance += 10;
                        user.reputation_score += 1;
                        users_map.insert(discussion.author, user);
                    }
                });

                discussions_map.insert(discussion_id, discussion);
            }
            Ok(())
        } else {
            Err(ScholarError::InvalidInput)
        }
    })
}

#[update]
fn upvote_response(discussion_id: u64, response_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    DISCUSSIONS.with(|discussions| {
        let mut discussions_map = discussions.borrow_mut();
        if let Some(mut discussion) = discussions_map.get(&discussion_id) {
            for response in &mut discussion.responses {
                if response.id == response_id && !response.upvotes.contains(&caller) {
                    response.upvotes.push(caller);
                    
                    // Award tokens and reputation to the response author (10 tokens per upvote)
                    USERS.with(|users| {
                        let mut users_map = users.borrow_mut();
                        if let Some(mut user) = users_map.get(&response.author) {
                            user.token_balance += 10;
                            user.reputation_score += 1;
                            users_map.insert(response.author, user);
                        }
                    });

                    discussions_map.insert(discussion_id, discussion);
                    return Ok(());
                }
            }
            Ok(())
        } else {
            Err(ScholarError::InvalidInput)
        }
    })
}

#[query]
fn get_discussions_for_course(course_id: u64) -> Vec<Discussion> {
    DISCUSSIONS.with(|discussions| {
        discussions
            .borrow()
            .iter()
            .filter(|(_, discussion)| discussion.course_id == course_id)
            .map(|(_, discussion)| discussion)
            .collect()
    })
}

#[query]
fn get_discussions() -> Vec<Discussion> {
    DISCUSSIONS.with(|discussions| {
        discussions
            .borrow()
            .iter()
            .map(|(_, discussion)| discussion)
            .collect()
    })
}

#[query]
fn get_discussion_details(discussion_id: u64) -> ScholarResult<Discussion> {
    DISCUSSIONS.with(|discussions| {
        discussions
            .borrow()
            .get(&discussion_id)
            .ok_or(ScholarError::InvalidInput)
    })
}

#[update]
fn like_discussion(discussion_id: u64) -> ScholarResult<()> {
    upvote_discussion(discussion_id)
}

#[update]
fn add_discussion_reply(discussion_id: u64, content: String) -> ScholarResult<()> {
    add_discussion_response(discussion_id, content)
}

#[query]
fn get_platform_stats() -> (u64, u64, u64, u64) {
    let user_count = USERS.with(|users| users.borrow().len());
    let course_count = COURSES.with(|courses| courses.borrow().len());
    let discussion_count = DISCUSSIONS.with(|discussions| discussions.borrow().len());
    let total_tokens = USERS.with(|users| {
        users.borrow().iter().map(|(_, user)| user.token_balance).sum::<u64>()
    });
    
    (user_count as u64, course_count as u64, discussion_count as u64, total_tokens)
}

#[query]
fn get_all_users() -> Vec<User> {
    USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user)
            .collect()
    })
}

#[query]
fn get_reports() -> Vec<(u64, String, String, String, u64)> {
    // For now, return empty reports. In a full implementation, you'd have a reports storage
    Vec::new()
}

// Admin action functions
#[update]
fn suspend_user(user_principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&user_principal) {
            user.active = false;
            users_map.insert(user_principal, user);
            Ok(())
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

#[update]
fn activate_user(user_principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&user_principal) {
            user.active = true;
            users_map.insert(user_principal, user);
            Ok(())
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

#[update]
fn promote_user(user_principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&user_principal) {
            user.role = UserRole::Educator;
            users_map.insert(user_principal, user);
            Ok(())
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

#[update]
fn demote_user(user_principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    USERS.with(|users| {
        let mut users_map = users.borrow_mut();
        if let Some(mut user) = users_map.get(&user_principal) {
            user.role = UserRole::Learner;
            users_map.insert(user_principal, user);
            Ok(())
        } else {
            Err(ScholarError::UserNotFound)
        }
    })
}

#[update]
fn approve_course(course_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    COURSES.with(|courses| {
        let mut courses_map = courses.borrow_mut();
        if let Some(mut course) = courses_map.get(&course_id) {
            course.status = CourseStatus::Published;
            courses_map.insert(course_id, course);
            Ok(())
        } else {
            Err(ScholarError::CourseNotFound)
        }
    })
}

#[update]
fn reject_course(course_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    COURSES.with(|courses| {
        let mut courses_map = courses.borrow_mut();
        if let Some(mut course) = courses_map.get(&course_id) {
            course.status = CourseStatus::Draft;
            courses_map.insert(course_id, course);
            Ok(())
        } else {
            Err(ScholarError::CourseNotFound)
        }
    })
}

#[update]
fn feature_course(course_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    COURSES.with(|courses| {
        let mut courses_map = courses.borrow_mut();
        if let Some(mut course) = courses_map.get(&course_id) {
            course.featured = true;
            courses_map.insert(course_id, course);
            Ok(())
        } else {
            Err(ScholarError::CourseNotFound)
        }
    })
}

#[update]
fn hide_course(course_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    COURSES.with(|courses| {
        let mut courses_map = courses.borrow_mut();
        if let Some(mut course) = courses_map.get(&course_id) {
            course.status = CourseStatus::Draft;
            courses_map.insert(course_id, course);
            Ok(())
        } else {
            Err(ScholarError::CourseNotFound)
        }
    })
}

#[update]
fn resolve_report(report_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }
    
    // For now, just return success. In a full implementation, you'd update the reports storage
    Ok(())
}

#[update]
fn dismiss_report(report_id: u64) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }
    
    // For now, just return success. In a full implementation, you'd update the reports storage
    Ok(())
}

// Admin Functions
#[update]
fn add_admin(principal: Principal) -> ScholarResult<()> {
    let caller = caller();
    
    if !is_admin(&caller) {
        return Err(ScholarError::Unauthorized);
    }

    ADMINS.with(|admins| {
        let mut admins_list = admins.borrow_mut();
        if !admins_list.contains(&principal) {
            admins_list.push(principal);
        }
    });

    Ok(())
}

#[query]
fn get_pending_educators() -> Vec<User> {
    USERS.with(|users| {
        users
            .borrow()
            .iter()
            .filter(|(_, user)| matches!(user.role, UserRole::PendingEducator))
            .map(|(_, user)| user)
            .collect()
    })
}

// System upgrade functions
#[pre_upgrade]
fn pre_upgrade() {
    // Stable memory is automatically handled by ic-stable-structures
}

#[post_upgrade]
fn post_upgrade() {
    // Stable memory is automatically restored by ic-stable-structures
}

// Export the candid interface
ic_cdk::export_candid!();
