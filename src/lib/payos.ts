// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PayOS } = require("@payos/node");

// Lazy singleton — tránh crash khi build (env chưa có)
let _payos: ReturnType<typeof createPayOS> | null = null;

function createPayOS() {
  return new PayOS(
    process.env.PAYOS_CLIENT_ID!,
    process.env.PAYOS_API_KEY!,
    process.env.PAYOS_CHECKSUM_KEY!
  );
}

export function getPayOS() {
  if (!_payos) _payos = createPayOS();
  return _payos;
}

export default getPayOS;
