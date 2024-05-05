import React, { useState, useEffect } from "react";
import axios from "axios";

const Lists = ({ accessToken }) => {
  const [albumId, setAlbumId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");

  const inputTextHandler = (e) => {
    console.log(e.target.value);
  };
  useEffect(() => {
    // Fetch existing lists when component mounts
    const fetchLists = async () => {
      try {
        const response = await axios.get("/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setLists(response.data.lists);
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    };

    if (accessToken) {
      fetchLists();
    }
  }, [accessToken]);

  const addAlbumToList = async (listId) => {
    try {
      const response = await axios.post(`/user/lists/${listId}/albums`, {
        albumId,
      });
      console.log(response.data); // Handle success response
    } catch (error) {
      console.error("Error adding album to list:", error); // Handle error
    }
  };

  const addArtistToList = async (listId) => {
    try {
      const response = await axios.post(`/user/lists/${listId}/artists`, {
        artistId,
      });
      console.log(response.data); // Handle success response
    } catch (error) {
      console.error("Error adding artist to list:", error); // Handle error
    }
  };

  const createNewList = async () => {
    try {
      const response = await axios.post("/user/lists", {
        name: newListName,
      });
      setLists([...lists, response.data]); // Update lists with the new list
      setNewListName(""); // Clear input after creating new list
    } catch (error) {
      console.error("Error creating new list:", error); // Handle error
    }
  };

  return (
    <div className="lists-container">
      <h2>Your Lists</h2>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>{list.name}</li>
        ))}
      </ul>
      <div>
        <input
          className="text-black"
          type="text"
          placeholder="Enter List Name"
          onChange={inputTextHandler}
        />
        <button onClick={createNewList}>Create New List</button>
      </div>
      <div></div>
    </div>
  );
};

export default Lists;
