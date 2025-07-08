import BarcodeScanner from "react-qr-barcode-scanner";

const QRScannerModal = ({ onDetected }) => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <BarcodeScanner
                width={150}
                height={150}
                facingMode="environment"
                onUpdate={(err, result) => {
                    if (result) {
                        onDetected(result.text);
                    }
                }}
            />
            <p>Scanning...</p>
        </div>
    );
};

export default QRScannerModal;
