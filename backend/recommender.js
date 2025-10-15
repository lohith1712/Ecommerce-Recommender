const products = require('./data/products.json');
const userEvents = require('./data/user_events.json');

function recommendForUser(userId, topN = 3) {
    // Get user's interacted products
    const userProductIds = userEvents.filter(e => e.user_id === userId).map(e => e.product_id);
    if(userProductIds.length === 0) return products.slice(0, topN);

    // Get categories user interacted with
    const categories = [...new Set(products.filter(p => userProductIds.includes(p.product_id)).map(p => p.category))];

    // Recommend products in those categories
    let recommended = products.filter(p => categories.includes(p.category));

    // Avoid duplicates
    recommended = recommended.filter(p => !userProductIds.includes(p.product_id));

    return recommended.slice(0, topN);
}

module.exports = { recommendForUser, products, userEvents };
