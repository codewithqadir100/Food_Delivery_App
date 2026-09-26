export const formatCurrency = (amount) => {
    const value = Number(amount ?? 0);

    return `Rs. ${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};
