import QRCode from "qrcode.react";

const QRCodeGenerator = ({ table_id }) => {
  const orderUrl = `http://192.168.1.44:5173/order/${table_id}`;

  return (
    <div>
      <h3>QR Code สำหรับโต๊ะ {table_id}</h3>
      <QRCode value={orderUrl} size={256} />
    </div>
  );
};

export default QRCodeGenerator;
