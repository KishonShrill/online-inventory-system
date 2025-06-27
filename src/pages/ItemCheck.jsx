import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import "../styles/itemCheck.scss";

const ItemCheck = () => {
  const inventory = useSelector((state) => state.inventory);

  const [scannedId, setScannedId] = useState("");
  const [item, setItem] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const timeOfDay = new Date().getHours() < 12 ? "Morning" : "Afternoon";
  const today = new Date().toISOString().slice(0, 10);

  const handleFetchItem = () => {
    setError("");
    setSuccess("");
    const foundItem = inventory.find((i) => i.id === scannedId);
    if (foundItem) {
      setItem(foundItem);
      const initialAttendance = {};
      if (foundItem.items && foundItem.items.length > 0) {
        foundItem.items.forEach((subItem) => {
          initialAttendance[subItem.name] = false;
        });
      }
      setAttendance(initialAttendance);
    } else {
      setError("Item ID not found. Please try again.");
      setItem(null);
    }
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

    const attendanceRecord = {
      itemId: item.id,
      itemName: item.name,
      date: today,
      session: timeOfDay,
      components: attendance,
      notes: notes,
      submittedBy: "Admin",
    };

    console.log(
      "Submitting Attendance Record:",
      JSON.stringify(attendanceRecord, null, 2)
    );

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
          <h1 className="itemCheck__title">Item Attendance Check</h1>
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
              onChange={(e) => setScannedId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetchItem();
                }
              }}
              placeholder="Scan or enter Item ID (e.g., EQP-0015)"
              className="itemCheck__input search"
            />
            <button onClick={handleFetchItem} className="itemCheck__card-fetchBtn actions-add">
              Fetch Item
            </button>
          </div>

          {error && <p className="itemCheck__message-error">{error}</p>}
          {success && <p className="itemCheck__message-success">{success}</p>}

          <br />
          <hr />
          <br />

          {item && (
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
