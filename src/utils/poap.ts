export const powerEmoji = (poapPower: number) => {
  return poapPower <= 5
    ? "🆕"
    : poapPower <= 10
    ? "🟢"
    : poapPower <= 20
    ? "🟡"
    : poapPower <= 50
    ? "🔴"
    : "🔥";
};
