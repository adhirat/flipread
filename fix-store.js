const fs = require('fs');
const file = './apps/web/src/routes/store.ts';
let content = fs.readFileSync(file, 'utf8');

// We need to add a helper function getStoreNavInfo
const navHelper = `
async function getStoreNavInfo(db, userId) {
  const pCount = await db.prepare('SELECT COUNT(*) as count FROM products WHERE store_id = ? AND status = "active"').bind(userId).first();
  const bCount = await db.prepare('SELECT COUNT(*) as count FROM books WHERE user_id = ? AND is_public = 1').bind(userId).first();
  return {
    hasProducts: (pCount?.count || 0) > 0,
    hasGallery: (bCount?.count || 0) > 0
  };
}
`;

content = content.replace(/(async function getUserByCustomDomain[\s\S]*?\n)/, "$1" + navHelper + "\n");
fs.writeFileSync(file, content);
console.log('done');
