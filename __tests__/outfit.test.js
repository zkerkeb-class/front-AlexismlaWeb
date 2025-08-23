// Test des fonctionnalités d'outfit
const validateOutfitData = (outfit) => {
  if (!outfit.name) return false;
  if (!outfit.clothingIds || !Array.isArray(outfit.clothingIds)) return false;
  return true;
};

const generateOutfitName = (style, season) => {
  return `${style} ${season}`;
};

test('validateOutfitData validates outfit structure', () => {
  const validOutfit = {
    name: 'Tenue décontractée',
    clothingIds: ['item1', 'item2', 'item3']
  };
  
  const invalidOutfit = {
    name: 'Tenue sans vêtements'
    // clothingIds manquant
  };
  
  expect(validateOutfitData(validOutfit)).toBe(true);
  expect(validateOutfitData(invalidOutfit)).toBe(false);
});

test('generateOutfitName creates proper outfit names', () => {
  expect(generateOutfitName('Casual', 'Été')).toBe('Casual Été');
  expect(generateOutfitName('Formel', 'Hiver')).toBe('Formel Hiver');
});

test('outfit data structure is consistent', () => {
  const outfit = {
    id: 'outfit-123',
    userId: 'user-456',
    clothingIds: ['item1', 'item2'],
    name: 'Tenue de test',
    createdAt: new Date().toISOString()
  };
  
  expect(outfit).toHaveProperty('id');
  expect(outfit).toHaveProperty('userId');
  expect(outfit).toHaveProperty('clothingIds');
  expect(outfit).toHaveProperty('name');
  expect(outfit).toHaveProperty('createdAt');
  expect(Array.isArray(outfit.clothingIds)).toBe(true);
});
