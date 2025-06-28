import { PlusCircle } from 'lucide-react'
import { Role } from "../helpers/_variables";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import '../styles/records.scss'

const Records = ({ initialBorrowRecords }) => {
	const cookies = new Cookies()
	const token = cookies.get("CDIIS-OIS")
	const decoded = jwtDecode(token);

	return (
		<>
			<title>CDIIS OIS - Borrower Records</title>
			<main>
				<div className="records__header">
					<h1 className="records__title">Borrow Records</h1>
					<button
					onClick={() => handleAdd()}
					className="inventory__header-addBtn"
					>
					<PlusCircle size={20} className="icon" />
					Add Record
					</button>
				</div>

				<h3 style={{marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default"}}>Reserved</h3>
				<div className="records__table-container">
					<table className="records__table">
						<thead className="records__table-header">
							<tr>
								<th className="records__table-header-column">Item Name</th>
								<th className="records__table-header-column">User</th>
								<th className="records__table-header-column">Expiry Date</th>
								<th className="records__table-header-column">Status</th>
								{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
									<th className="records__table-header-column">Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{initialBorrowRecords.map((record) => (
								<tr key={record.id} className="records__table-data-row">
									<td className="records__table-data-column">{record.itemName}</td>
									<td className="records__table-data-column">{record.borrower}</td>
									<td className="records__table-data-column">{record.expiryDate}</td>
									<td className="p3-text-sm">
										<span className={`status`}>Borrowed</span>
									</td>
									{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
									<td><button>Lend</button></td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<br />
				<br />

				<h3 style={{marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default"}}>Borrowed</h3>
				<div className="records__table-container">
					<table className="records__table">
						<thead className="records__table-header">
							<tr>
								<th className="records__table-header-column">Item Name</th>
								<th className="records__table-header-column">User</th>
								<th className="records__table-header-column">Borrowed On</th>
								<th className="records__table-header-column">Due Date</th>
								<th className="records__table-header-column">Returned On</th>
								<th className="records__table-header-column">Status</th>
								{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
								<th className="records__table-header-column">Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{initialBorrowRecords.map((record) => (
								<tr key={record.id} className="records__table-data-row">
									<td className="records__table-data-column">{record.itemName}</td>
									<td className="records__table-data-column">{record.borrower}</td>
									<td className="records__table-data-column">{record.borrowDate}</td>
									<td className="records__table-data-column">{record.expiryDate}</td>
									<td className="records__table-data-column"></td>
									<td className="p3-text-sm">
										<span className={`status`}>Borrowed</span>
									</td>
									{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
										<td className="p3-text-sm">
											<button>Return</button>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
		</>
	)
}

export default Records