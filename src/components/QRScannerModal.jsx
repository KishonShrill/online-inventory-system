import BarcodeScanner from "react-qr-barcode-scanner";

const QRScannerModal = ({ onDetected }) => {
    return (
        <>
            <style>{`
                #qr-scanner > video {
                    margin-block: 1rem;
                }
            `}</style>
            <div id={"qr-scanner"} style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <BarcodeScanner
                    // height={350}
                    facingMode="environment"
                    onUpdate={(err, result) => {
                        if (result) {
                            onDetected(result.text);
                        }
                    }}
                />
                <p>Scanning...</p>
            </div>
        </>
    );
};

export default QRScannerModal;
