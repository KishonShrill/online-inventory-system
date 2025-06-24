import '../styles/records.scss'

const Records = ({ initialBorrowRecords }) => {
    return (
        <>
            <title>CDIIS OIS - Borrower Records</title>
            <div>
                <h1 className="records__title">Borrow Records</h1>
                <div className="records__table-container">
                    <table className="records__table">
                        <thead className="records__table-header">
                            <tr>
                                <th className="records__table-header-column">Item Name</th>
                                <th className="records__table-header-column">Borrower</th>
                                <th className="records__table-header-column">Borrow Date</th>
                                <th className="records__table-header-column">Expiry Date</th>
                                <th className="records__table-header-column">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialBorrowRecords.map((record) => (
                                <tr key={record.id} className="records__table-data-row">
                                    <td className="records__table-data-column">{record.itemName}</td>
                                    <td className="records__table-data-column">{record.borrower}</td>
                                    <td className="records__table-data-column">{record.borrowDate}</td>
                                    <td className="records__table-data-column">{record.expiryDate}</td>
                                    <td className="p3-text-sm">
                                        <span className={`status`}>Borrowed</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default Records