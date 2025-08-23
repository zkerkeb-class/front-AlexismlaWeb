// Tests pour la logique de validation des données

// Fonctions de validation basées sur la logique de l'app
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return !!(password && password.length >= 6);
};

const validateClothingItem = (item) => {
  const requiredFields = ['type', 'color', 'imageUrl'];
  return requiredFields.every(field => item[field] && item[field].trim() !== '');
};

const validateOutfit = (outfit) => {
  return !!(outfit && 
           outfit.name && 
           outfit.clothingIds && 
           Array.isArray(outfit.clothingIds) && 
           outfit.clothingIds.length > 0);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

describe('Validation Logic Tests', () => {
  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user space@domain.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate correct passwords', () => {
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('strongPassword!')).toBe(true);
    });

    test('should reject invalid passwords', () => {
      expect(validatePassword('12345')).toBe(false); // trop court
      expect(validatePassword('')).toBe(false); // vide
      expect(validatePassword(null)).toBe(false); // null
      expect(validatePassword(undefined)).toBe(false); // undefined
    });
  });

  describe('Clothing Item Validation', () => {
    test('should validate complete clothing items', () => {
      const validItem = {
        type: 'T-shirt',
        color: 'Rouge',
        imageUrl: 'https://example.com/image.jpg',
        brand: 'Nike'
      };

      expect(validateClothingItem(validItem)).toBe(true);
    });

    test('should reject incomplete clothing items', () => {
      const missingType = {
        color: 'Rouge',
        imageUrl: 'https://example.com/image.jpg'
      };

      const missingColor = {
        type: 'T-shirt',
        imageUrl: 'https://example.com/image.jpg'
      };

      const missingImage = {
        type: 'T-shirt',
        color: 'Rouge'
      };

      expect(validateClothingItem(missingType)).toBe(false);
      expect(validateClothingItem(missingColor)).toBe(false);
      expect(validateClothingItem(missingImage)).toBe(false);
    });
  });

  describe('Outfit Validation', () => {
    test('should validate complete outfits', () => {
      const validOutfit = {
        name: 'Tenue décontractée',
        clothingIds: ['item1', 'item2', 'item3'],
        userId: 'user123'
      };

      expect(validateOutfit(validOutfit)).toBe(true);
    });

    test('should reject invalid outfits', () => {
      const noName = {
        clothingIds: ['item1', 'item2']
      };

      const noClothing = {
        name: 'Tenue test'
      };

      const emptyClothing = {
        name: 'Tenue test',
        clothingIds: []
      };

      expect(validateOutfit(noName)).toBe(false);
      expect(validateOutfit(noClothing)).toBe(false);
      expect(validateOutfit(emptyClothing)).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize user inputs', () => {
      expect(sanitizeInput('  Hello World  ')).toBe('Hello World');
      expect(sanitizeInput('<script>alert("hack")</script>')).toBe('scriptalert("hack")/script');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('')).toBe('');
    });

    test('should handle non-string inputs', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('');
      expect(sanitizeInput({})).toBe('');
    });
  });
});
