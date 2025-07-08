
import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addAttendance } from "../redux/actions/attendanceActions";
import { ScanIcon } from "lucide-react";
import { jwtDecode } from 'jwt-decode';
import Cookies from "universal-cookie";
import axios from "axios";

import QRScannerModal from "../components/QRScannerModal";
import { Role } from "../helpers/_variables";
import { getLocalISODateTime, itemHasBeenChecked } from "../helpers/dateUtils";

import "../styles/itemCheck.scss";

const postURL =
  import.meta.env.VITE_DEVELOPMENT === "true"
    ? `http://${import.meta.env.VITE_LOCALHOST}:5000/api/attendances`
    : `https://cdiis-ois-server.vercel.app/api/attendances`;


const ItemCheck = () => {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [scannedId, setScannedId] = useState("");
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [item, setItem] = useState(null);

  const cookies = new Cookies()
  const token = cookies.get("CDIIS-OIS")
  const decoded = jwtDecode(token);
  const dispatch = useDispatch();

  if (decoded.userRole !== Role.ADMIN && decoded.userRole !== Role.MANAGER) {
    alert("You are not allowed in here!")
    return <Navigate to="/app/dashboard" replace />;
  }

  const attendances = useSelector((state) => state.attendance);
  const inventory = useSelector((state) => state.inventory);
  const timeOfDay = getLocalISODateTime().split('T')[1].split(':')[0] < 12 ? "Morning" : "Afternoon";
  const today = getLocalISODateTime().split('T')[0];
  
  const handleFetchItem = () => {
    setError("");
    setSuccess("");
    setItem(null);
    setIsAlreadySubmitted(false);

    const foundItem = inventory.find((i) => i.id === scannedId);

    if (!foundItem) {
      setError("Item ID not found. Please try again.");
      return;
    }

    setItem(foundItem);

    const itemHistory = attendances.find(a => a.id === foundItem.id);

    const alreadyChecked = itemHistory &&
      itemHasBeenChecked(itemHistory.attendance_checks, timeOfDay);

    if (alreadyChecked) {
      setError(`This item has already been checked for the ${timeOfDay} session today.`);
      setIsAlreadySubmitted(true);
      return;
    }

    // Build initial attendance state
    const initialAttendance = {};
    foundItem.items?.forEach((subItem) => {
      initialAttendance[subItem.name] = false;
    });

    setAttendance(initialAttendance);
  };


  const handleSubItemCheck = (subItemName) => {
    setAttendance((prev) => ({
      ...prev,
      [subItemName]: !prev[subItemName],
    }));
  };

  const handleSubmit = () => {
    if (!item) {
      setError("No item scanned.");
      return;
    }

    // 1. Format the `items_checked` array correctly
    const items_checked_payload = item.items.map(subItem => ({
      component_name: subItem.name,
      quantity: subItem.quantity || 1, // Make sure your item object has quantity
      is_present: !!attendance[subItem.name],
    }));

    // 2. Create the new attendance check object that matches the schema
    const newAttendanceCheck = {
      timestamp: getLocalISODateTime(),
      period: timeOfDay,
      notes: notes,
      items_checked: items_checked_payload,
      // The timestamp will be added by `default: Date.now` in Mongoose
    };

    const attendanceRecord = {
      id: item.id,
      name: item.name,
      category: item.category,
      date: today,
      attendance_checks: newAttendanceCheck,
      submittedBy: {
        [timeOfDay]: decoded.userId,
      },
    };

    const configuration = {
      method: "post",
      url: postURL,
      data: attendanceRecord,
    };

    axios(configuration)
      .then((res) => {
        console.log(res.data)
        dispatch(addAttendance(res.data.result));
      })
      .catch((err) => {
        console.log(err)
        console.log(err.response.data.message)
      })

    setSuccess(
      `Attendance for ${item.name} (${timeOfDay}) submitted successfully!`
    );
    setItem(null);
    setScannedId("");
    setNotes("");
    setAttendance({});
  };

  return (
    <>
      <title>CDIIS OIS - Inventory Check</title>
      <div className="itemCheck__container">
        <div className="itemCheck__header">
          <h1 className="itemCheck__title">Item Attendance</h1>
          <div className="itemCheck__timeInfo">
            <p className="itemCheck__date">{today}</p>
            <p className="itemCheck__session">{timeOfDay} Session</p>
          </div>
        </div>

        <div className="itemCheck__card">
          <div className="itemCheck__card-inputRow">
            <input
              type="text"
              value={scannedId}
              onChange={(e) => setScannedId(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetchItem();
                }
              }}
              placeholder="Scan or enter Item ID (e.g., EQP-0015)"
              className="itemCheck__input search"
            />
            <button onClick={handleFetchItem} className="itemCheck__card-fetchBtn actions-add">
              Fetch
            </button>
            <button type="button" className="scan-btn" title="Scan QR code" onClick={() => setIsQROpen(prev => !prev)}>
                <ScanIcon />
            </button>
          </div>

          {isQROpen && (
              <QRScannerModal
                  onDetected={(scannedText) => {
                      setScannedId(scannedText.toUpperCase()); // sets the input
                      setIsQROpen(false);
                  }}
              />
          )}

          {error && <p className="itemCheck__message-error">{error}</p>}
          {success && <p className="itemCheck__message-success">{success}</p>}

          <br />
          <hr />
          <br />

          {item && !isAlreadySubmitted && (
            <div className="itemCheck__details">
              <h3 className="itemCheck__itemTitle">{item.name}</h3>
              <p className="itemCheck__itemInfo">ID: {item.id}</p>
              <p className="itemCheck__itemInfo">Category: {item.category}</p>

              {item.items && item.items.length > 0 && (
                <div className="itemCheck__component">
                  <h4 className="itemCheck__component-title">
                    Check Components:
                  </h4>
                  <ul className="itemCheck__component-list">
                    {item.items.map((subItem) => (
                      <label
                        key={subItem.name}
                        className="itemCheck__component-item"
                      >
                        <input
                          type="checkbox"
                          checked={attendance[subItem.name] || false}
                          onChange={() => handleSubItemCheck(subItem.name)}
                          className="itemCheck__component-checkbox"
                        />
                        <span className="itemCheck__componentText">
                          {subItem.name}
                        </span>
                      </label>
                    ))}
                  </ul>
                </div>
              )}

              <div className="itemCheck__notes">
                <label htmlFor="notes" className="itemCheck__notesLabel">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Mouse is slightly damaged, keyboard is missing a key."
                  className="itemCheck__notesInput"
                  rows="3"
                ></textarea>
              </div>

              <button onClick={handleSubmit} className="itemCheck__submit actions-create">
                Submit Attendance
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemCheck;
