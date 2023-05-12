import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const SearchBox = styled.div`
  display: flex;
  flex-direction: row;
  background: #f6f6f6;
  padding: 10px;
`;
const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  background: white;
  border-radius: 16px;
  width: 40%;
  padding: 5px 10px;
  gap: 10px;
`;
const SearchIcon = styled.img`
  width: 28px;
  height: 28px;
`;
const SearchInput = styled.input`
  width: 100%;
  outline: none;
  border: none;
  font-size: 15px;
`;
const ChatPlaceholder = styled.img`
  width: 240px;
  height: 240px;
  border-radius: 50%;
  object-fit: contain;
`;
const Placeholder = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  gap: 10px;
  color: rgba(0, 0, 0, 0.45);

  span {
    font-size: 32px;
    color: #525252;
  }
`;

const ContactItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #f2f2f2;
  background: white;
  cursor: pointer;

  :hover {
    background: #ebebeb;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 12px;
`;

const ContactName = styled.span`
  width: 100%;
  font-size: 16px;
  color: black;
`;
const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
`;
const ProfileIcon = styled(ProfileImage)`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  margin-left: 12px;
  margin-top: 15px;
  margin-bottom: 15px;
  object-fit: cover;
`;

const Main = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const url = "http://localhost:8080/api/auth/contacts";
      const token = localStorage.getItem("token");
      if (!token) return 

      const options = {
        headers: {
          Authorization: token,
        },
      };
      const res = await axios.get(url, options);

      setContacts(res.data.contacts);
    } catch (error) {
      console.error(error);
    }
  }

  async function submits(event) {
    event.preventDefault();

    const url = "http://localhost:8080/api/auth/contact";
    const token = localStorage.getItem("token");
    if (!token) return 
    const data = {
      phonenumber: newContact
    };

    const options = {
      headers: {
        Authorization: token,
      },
    };

    try {
      await axios.put(url, data, options);
      await fetchContacts();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setInterval(async function () {
      try {
        const url = "http://localhost:8080/api/messages";
        const token = localStorage.getItem("token");
        if (!token) return 

        const options = {
          headers: {
            Authorization: token,
          },
        };
        const res = await axios.get(url, options);

        setMessages(res.data.messages);
      } catch (error) {
        console.error(error);
      }
    }, 5000);
  }

  function selectContact(id) {
    const contact = contacts.find((contact) => contact._id === id);
    setSelectedContact(contact);
  }

  function getContactMessages(contact) {

    const contactMessages = messages.filter(
      (message) =>
        message.from === contact._id || (message.receiveto === contact._id)
    );
    return contactMessages;
  }

  async function submit(event) {
    event.preventDefault();

    const url = "http://localhost:8080/api/messages/send";
    const token = localStorage.getItem("token");
    if (!token) return 
    const data = {
      receiveto: selectedContact._id,
      message: newMessage,
    };

    const options = {
      headers: {
        Authorization: token,
      },
    };

    try {
      await axios.post(url, data, options);
      await fetchMessages();
    } catch (error) {
      console.log(error);
    }
  }

  const selectedMessages = selectedContact
    ? getContactMessages(selectedContact)
    : [];

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1>Whatsappp</h1>
        <button className={styles.white_btn} onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div className={styles.sidebar_container}>
        <div className={styles.sidebar}>
          <SearchBox>
            <SearchContainer>
              <SearchIcon src={"/logo/search-icon.svg"} />
              <SearchInput placeholder="Search" />
            </SearchContainer>
            <form onSubmit={submits} className={styles.contact_box}>
              <input
                type="text"
                placeholder="Phone Number"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
              />
              <button>Add</button>
            </form>
          </SearchBox>
          {contacts.map((contact) => {
            return (
              <ContactItem
                key={contact._id}
                onClick={() => selectContact(contact._id)}
              >
                <ProfileImage src={contact.profilepicture} />
                <ContactInfo>
                  <ContactName>{contact.name}</ContactName>
                </ContactInfo>
              </ContactItem>
            );
          })}
        </div>
        {!selectedContact ? (
          <Placeholder>
            <ChatPlaceholder src="/logo/welcome-placeholder.jpeg" />
            <span>Keep your phone connected</span>
            WhatsApp connects to your phone to sync messages.
          </Placeholder>
        ) : (
          <div className={styles.chat}>
            <div className={styles.chat_container}>
              {selectedMessages.map((selectedMessage) => {
                const isSender = selectedMessage.from !== selectedContact._id;

                return (
                  <div>
                    {isSender && (
                      <div className={styles.sender_message}>
                        <p className={styles.sender}>
                          {selectedMessage.message}
                        </p>
                      </div>
                    )}
                    {!isSender && (
                      <div className={styles.receiver_message}>
                        <p className={styles.receiver}>
                          {selectedMessage.message}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <form onSubmit={submit} className={styles.chat_box}>
              <input
                type="text"
                placeholder="Enter your message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className={styles.btn}>send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
