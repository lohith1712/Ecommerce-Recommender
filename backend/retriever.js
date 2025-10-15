const { products, userEvents } = require('./recommender');

function buildRAGContext(userId, recommendedProducts) {
    const userHistory = userEvents.filter(e => e.user_id === userId)
        .map(e => `${e.event_type} product_id=${e.product_id}`).join(", ");

    const productDetails = recommendedProducts.map(p =>
        `${p.title} (${p.category}): ${p.description}`).join("\n");

    const context = `User History: ${userHistory}\nRecommended Products:\n${productDetails}`;
    return context;
}

module.exports = { buildRAGContext };
