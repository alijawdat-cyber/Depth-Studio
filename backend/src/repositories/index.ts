/**
 * 📂 Repository Index
 * 
 * تطوير علي جودت - Depth Studio
 * آخر تحديث: يونيو 2025
 * 
 * @description Central export point for all repositories
 * @version 1.0.0
 */

// Base Repository exports
export { BaseRepository, BaseEntity, QueryFilter, QueryOptions, PaginationResult } from './BaseRepository';

// Specific Repository exports
export { UserRepository, UserEntity, UserSearchFilters } from './UserRepository';
export { BrandRepository, BrandEntity, BrandSearchFilters } from './BrandRepository';
export { CampaignRepository, CampaignEntity, CampaignSearchFilters } from './CampaignRepository';

// Repository instances (Singleton pattern)
let userRepository: UserRepository;
let brandRepository: BrandRepository;
let campaignRepository: CampaignRepository;

/**
 * Get User Repository instance
 */
export const getUserRepository = (): UserRepository => {
  if (!userRepository) {
    userRepository = new UserRepository();
  }
  return userRepository;
};

/**
 * Get Brand Repository instance
 */
export const getBrandRepository = (): BrandRepository => {
  if (!brandRepository) {
    brandRepository = new BrandRepository();
  }
  return brandRepository;
};

/**
 * Get Campaign Repository instance
 */
export const getCampaignRepository = (): CampaignRepository => {
  if (!campaignRepository) {
    campaignRepository = new CampaignRepository();
  }
  return campaignRepository;
};

/**
 * Repository factory for getting any repository by name
 */
export const getRepository = (repositoryName: 'user' | 'brand' | 'campaign') => {
  switch (repositoryName) {
    case 'user':
      return getUserRepository();
    case 'brand':
      return getBrandRepository();
    case 'campaign':
      return getCampaignRepository();
    default:
      throw new Error(`Unknown repository: ${repositoryName}`);
  }
};

/**
 * Reset all repository instances (useful for testing)
 */
export const resetRepositories = (): void => {
  userRepository = undefined as any;
  brandRepository = undefined as any;
  campaignRepository = undefined as any;
};

// Default exports for convenience
export default {
  getUserRepository,
  getBrandRepository,
  getCampaignRepository,
  getRepository,
  resetRepositories
}; 