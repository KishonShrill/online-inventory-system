import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editRecord } from '../redux/actions/recordActions';
import { PlusCircle } from 'lucide-react'
import { Role } from "../helpers/_variables";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import axios from "axios";

import RecordModal from "../components/RecordModal";

import '../styles/records.scss';

const postURL =
	import.meta.env.VITE_DEVELOPMENT === "true"
		? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/records`
		: `https://cdiis-ois-server.vercel.app/api/records`;


const Records = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
	
	const cookies = new Cookies()
	const token = cookies.get("CDIIS-OIS")
	const decoded = jwtDecode(token);
	const dispatch = useDispatch()

	const records = useSelector((state) => state.record);

	const reservedRecords = records.filter(item => item.type?.toLowerCase().includes("reserve"))
	const borrowedRecords = records.filter(item => {
		return (
			item.type?.toLowerCase().includes("borrow") ||
			item.type?.toLowerCase().includes("returned")
		)
	})

	const handleAdd = () => {
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

	const handleLend = (record) => {
		const todayPlus7 = new Date();
		todayPlus7.setDate(todayPlus7.getDate() + 7);
		const borrowDueDate = todayPlus7.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

		const configuration = {
			method: "post",
			url: postURL,
			data: {
				_id: record?._id,
				user: {
					name: record?.user.name,
					contact: record?.user.contact,
				},
                item: {
                    id: record?.item.id,
                    name: record?.item.name,
                },
                date: borrowDueDate,
				type: 'borrow',
			},
		};

		axios(configuration)
			.then((res) => {
				console.log(res.data);
				dispatch(editRecord(res.data.result.updatedRecord))
			})
			.catch((err) => {
				console.log(err);
        		alert(err.response.data.message);
			})
	}

	const handleRetract = (record) => {
		const configuration = {
			method: "post",
			url: postURL,
			data: {
				_id: record?._id,
				type: "cancelled",
			}
		}

		axios(configuration)
			.then((res) => {
				console.log(res.data);
				dispatch(editRecord(res.data.result.updatedRecord))
			})
			.catch((err) => {
				console.log(err);
				alert(err.response.data.message);
			})
	}

	const handleReturn = (record) => {
		const dateToday = new Date().toLocaleDateString('en-CA');

		const configuration = {
			method: "post",
			url: postURL,
			data: {
				_id: record?._id,
				item: {
					id: record?.item.id,
				},
				date: dateToday,
				type: 'returned',
			}
		}

		axios(configuration)
			.then((res) => {
				console.log(res.data)
				dispatch(editRecord(res.data.result.updatedRecord))
			})
			.catch((err) => {
				console.log(err);
				alert(err.response.data.message);
			})
	}

	return (
		<>
			<title>CDIIS OIS - Borrower Records</title>
			<main>
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
				</div>

				<h3 style={{marginLeft: "1rem", marginBottom: "1rem", textDecoration: "underline", cursor: "default"}}>Reserved</h3>
				<div className="records__table-container">
					<table className="records__table">
						<thead className="records__table-header">
							<tr>
								<th className="records__table-header-column">Item Name</th>
								<th className="records__table-header-column">User</th>
								<th className="records__table-header-column">Contact</th>
								<th className="records__table-header-column">Due Date</th>
								<th className="records__table-header-column">Status</th>
								{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
									<th className="records__table-header-column">Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{reservedRecords.map((record) => (
								<tr key={record?._id} className="records__table-data-row">
									<td className="records__table-data-column">{record?.item.name} ({record?.item.id})</td>
									<td className="records__table-data-column">{record?.user.name}</td>
									<td className="records__table-data-column">{record?.user.contact}</td>
									<td className="records__table-data-column">{record?.due_date?.split("T")[0]}</td>
									<td className="p3-text-sm">
										{
											(new Date().toLocaleDateString('en-CA') < record?.due_date?.split("T")[0])
											? (<span className="status">{record?.type}</span>)
											: (<span className="status expired">Expired</span>)
										}										
									</td>
									<td>
										{(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
										<RecordActions
											record={record}
											handleLend={handleLend}
											handleRetract={handleRetract}
										/>
										)}
									</td>
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
							{borrowedRecords.map((record) => (
								<tr key={record._id} className="records__table-data-row">
									<td className="records__table-data-column">{record.item.name} ({record.item.id})</td>
									<td className="records__table-data-column">{record.user.name}</td>
									<td className="records__table-data-column">{record.start_date?.split("T")[0]}</td>
									<td className="records__table-data-column">{record.due_date?.split("T")[0]}</td>
									<td className="records__table-data-column">{record?.returned_on?.split("T")[0]}</td>
									<td className={`p3-text-sm`} >
										<span className={`status ${
											record?.type === 'returned' // Returned if returned, cancelled, else borrowed
											? 'returned'
											: record?.type === 'cancelled'
												? 'cancelled'
												: 'borrowed'
											}`}>
											{record?.type === 'returned'
											? 'Returned'
											: record?.type === 'cancelled'
												? 'Cancelled'
												: 'Borrowed'}
										</span>
									</td>
									<td className="p3-text-sm">
										{record?.type === 'returned' ? (
											<span>✅</span>
										) : (
											(decoded.userRole === Role.ADMIN || decoded.userRole === Role.MANAGER) && (
											new Date().toLocaleDateString('en-CA') < record?.due_date?.split("T")[0]
												? <button className="actions-warning" onClick={() => handleReturn(record)}>Return</button>
												: <button className="actions-danger" onClick={() => handleReturn(record)}>Return</button>
											)
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</main>
			<RecordModal isOpen={isModalOpen} onClose={handleCloseModal} />
		</>
	)
}

const RecordActions = ({ record, handleLend, handleRetract }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const dueDate = record?.due_date?.split("T")[0];
  const isExpired = today >= dueDate;

  return (
    <>
      <button className="actions-add" onClick={() => handleLend(record)}>Lend</button>
      {isExpired && (
        <button className="actions-danger" onClick={() => handleRetract(record)}>Retract</button>
      )}
    </>
  );
};

export default Records