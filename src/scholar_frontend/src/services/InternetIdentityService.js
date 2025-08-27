import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '../../../declarations/scholar_backend';
import { canisterId as backendCanisterId } from '../../../declarations/scholar_backend';

class InternetIdentityService {
  constructor() {
    this.authClient = null;
    this.identity = null;
    this.actor = null;
    this.isAuthenticated = false;
    this.user = null;
  }

  async initialize() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return { success: false, error: 'Not in browser environment' };
      }

      this.authClient = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 minutes
          disableDefaultIdleCallback: true,
        },
      });

      // Check if user is already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        this.identity = this.authClient.getIdentity();
        this.isAuthenticated = true;

        // Create actor with authenticated identity
        await this.createActor();

        // Try to get user data
        await this.loadUserData();

        return { success: true, isAuthenticated: true, user: this.user };
      }

      return { success: true, isAuthenticated: false };
    } catch (error) {
      console.error('Failed to initialize Internet Identity:', error);
      return { success: false, error: error.message };
    }
  }

  async createActor() {
    const isLocalhost = process.env.DFX_NETWORK !== 'ic';
    const host = isLocalhost ? 'http://localhost:4943' : 'https://ic0.app';

    this.actor = createActor(backendCanisterId, {
      agentOptions: {
        host,
        identity: this.identity,
      },
    });
  }

  async loadUserData() {
    try {
      if (!this.actor) return;

      const userData = await this.actor.get_current_user();
      if ('Ok' in userData) {
        this.user = userData.Ok;
        return { success: true, user: this.user };
      } else {
        // User not registered yet
        this.user = null;
        return { success: true, user: null };
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.user = null;
      return { success: false, error: error.message };
    }
  }

  async login() {
    try {
      if (!this.authClient) {
        await this.initialize();
      }

      const isLocalhost = process.env.DFX_NETWORK !== 'ic';
      let identityProviderUrl;

      if (isLocalhost) {
        // For local development, use the simpler URL format
        identityProviderUrl = `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943/`;
      } else {
        identityProviderUrl = 'https://identity.ic0.app';
      }

      console.log('Identity Provider URL:', identityProviderUrl); // Debug log

      return new Promise((resolve, reject) => {
        this.authClient.login({
          identityProvider: identityProviderUrl,
          // Use redirect flow instead of popup to avoid blank page issues
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: async () => {
            try {
              this.identity = this.authClient.getIdentity();
              this.isAuthenticated = true;

              // Create actor with authenticated identity
              await this.createActor();

              // Get the principal from the identity
              const principal = this.identity.getPrincipal().toText();

              // Try to load user data
              const result = await this.loadUserData();

              resolve({
                success: true,
                principal,
                identity: this.identity,
                actor: this.actor,
                hasProfile: !!this.user,
                user: this.user
              });
            } catch (error) {
              reject({ success: false, error: error.message });
            }
          },
          onError: (error) => {
            console.error('Internet Identity login error:', error);
            reject({ success: false, error: error.message || 'Login failed' });
          },
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      if (this.authClient) {
        await this.authClient.logout();
        this.identity = null;
        this.actor = null;
        this.isAuthenticated = false;
        this.user = null;
        return { success: true };
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async registerUser(username, role) {
    try {
      if (!this.actor) {
        throw new Error('Not authenticated');
      }

      // Check if user already exists for this identity
      const existingUser = await this.actor.get_current_user();
      if ('Ok' in existingUser) {
        throw new Error('User already registered with this identity. Each Internet Identity can only create one account.');
      }

      const result = await this.actor.register_user(username, { [role]: null });
      if ('Ok' in result) {
        this.user = result.Ok;
        return { success: true, user: this.user };
      } else {
        const errorKey = Object.keys(result.Err)[0];
        let errorMessage = errorKey;

        // Provide more user-friendly error messages
        if (errorKey === 'UserAlreadyExists') {
          errorMessage = 'A user with this identity already exists. Each Internet Identity can only create one account.';
        } else if (errorKey === 'UsernameAlreadyTaken') {
          errorMessage = 'This username is already taken. Please choose a different username.';
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserData() {
    return await this.loadUserData();
  }

  async getBalance() {
    try {
      if (!this.actor) return 0;

      const principal = this.identity.getPrincipal();
      const balance = await this.actor.get_user_balance(principal);
      return Number(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  // Getter methods
  getIdentity() {
    return this.identity;
  }

  getActor() {
    return this.actor;
  }

  getPrincipal() {
    if (this.identity) {
      return this.identity.getPrincipal().toText();
    }
    return null;
  }

  getUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  hasUserProfile() {
    return !!this.user;
  }

  // Add a method to check if user exists without storing the result
  async checkUserExists() {
    try {
      if (!this.actor) return false;

      const userData = await this.actor.get_current_user();
      return 'Ok' in userData;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }
}

// Create a singleton instance
const internetIdentityService = new InternetIdentityService();

export default internetIdentityService;
