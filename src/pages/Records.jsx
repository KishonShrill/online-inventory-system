import { useState } from "react";
import { PlusCircle } from 'lucide-react'
import { Role } from "../helpers/_variables";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';

import RecordModal from "../components/RecordModal";

import ReserveTable from "../components/Records/ReserveTable";
import BorrowTable from "../components/Records/BorrowTable";

import '../styles/records.scss';


const Records = () => {

	const cookies = new Cookies()
	const token = cookies.get("CDIIS-OIS")
	const decoded = jwtDecode(token);

	return (
		<>
			<title>CDIIS OIS - Borrower Records</title>
			<main>
				<RecordHeader decoded={decoded} />
				<ReserveTable decoded={decoded} />
				<br />
				<br />
				<BorrowTable decoded={decoded} />
			</main>
		</>
	)
}

function RecordHeader({ decoded }) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleAdd = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};
	return (
		<div className="records__header">
			<h1 className="records__title">Borrow Records</h1>

			{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
				<button
					onClick={() => handleAdd()}
					className="inventory__header-addBtn actions-add"
					title="Add Record"
				>
					<PlusCircle size={20} className="icon" />
					Add Record
				</button>
			)}
			<RecordModal isOpen={isModalOpen} onClose={handleCloseModal} />
		</div>
	)
}

export default Records