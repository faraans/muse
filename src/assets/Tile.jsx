import { useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Search_Dropdown from "./Search_Dropdown";

export const Tile = ({ accessToken, index }) => {
  const [image, setImage] = useState(null);
  const [showDropDownIndex, setShowDropDownIndex] = useState(null);

  const handleButtonClick = (index) => {
    setShowDropDownIndex(showDropDownIndex === index ? null : index);
  };
  return (
    <div key={index}>
      <button onClick={() => handleButtonClick(index)} className="card">
        {image !== null ? (
          <img className="image" src={image} alt={"hello"} />
        ) : (
          <AddCircleOutlineIcon />
        )}
      </button>
      {showDropDownIndex === index && (
        <Search_Dropdown accessToken={accessToken} setImage={setImage} />
      )}
    </div>
  );
};
