export const G = {
  green : "#1B6B35",
  deep  : "#0F4422",
  mid   : "#2D9E58",
  light : "#E8F5EC",
  faint : "#D4E8D4",
  dim   : "rgba(27,107,53,0.08)",
  bdr   : "rgba(27,107,53,0.13)",
  text  : "#1A2E1A",
  muted : "#5C7A5C",
  red   : "#C0392B",
  amber : "#B8780A",
  card  : "#FFFFFF",
  bg    : "linear-gradient(158deg,#E3EFE3 0%,#F0F7F0 50%,#E8F3E8 100%)",
};

export const cardStyle = (extra = {}) => ({
  background   : G.card,
  border       : `1px solid ${G.bdr}`,
  borderRadius : 16,
  padding      : "18px 20px",
  boxShadow    : "0 2px 18px rgba(27,107,53,0.07)",
  ...extra,
});
