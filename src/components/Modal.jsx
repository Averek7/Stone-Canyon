import React from "react";

const Modal = ({ isOpen, onClose, userDetails, setUserDetails, onConfirm, serviceID, modalType }) => {
  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm();
  };

  const handleEdit = (e) => {
    setUserDetails({
      name: "",
      email: "",
      zipcode: "",
      address: "",
      phone: "",
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button-modal" onClick={onClose}>
          ✖️
        </span>
        {modalType === "confirm" && (
          <>
            <h3>Confirm Your Details</h3>
            <form onSubmit={handleConfirm}>
              <input
                type="text"
                placeholder="Name"
                value={userDetails.name}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, email: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Zipcode"
                value={userDetails.zipcode}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, zipcode: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={userDetails.address}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, address: e.target.value })
                }
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={userDetails.phone}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, phone: e.target.value })
                }
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="submit-button-modal">
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="edit-button-modal"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
        
        {modalType === "serviceID" && (
          <div>
            <h3>Your Service ID</h3>
            <p>{serviceID}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
