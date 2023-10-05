import React, { useState, useEffect, useRef } from "react";
import ACTIONS from "../api/actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { createSocketConnection } from "../sockets/collaborationServiceSocket";
import {
    useNavigate,
    useParams,
} from "react-router-dom";
import styles from "../styles/pages/Room.module.css";
import RoomQuestion from "../components/RoomQuestion";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Room = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    
    const [resultsVisible, setResultsVisible] = useState(false);

    useEffect(() => {
        const init = async () => {
            const token = JSON.parse(localStorage.getItem('credentials')).sessionToken;

            socketRef.current = createSocketConnection(token, roomId);
            socketRef.current.on("connect_error", (err) => handleErrors(err));
            socketRef.current.on("connect_failed", (err) => handleErrors(err));

            function handleErrors(e) {
                console.log("socket error", e);
                alert("Unauthorized");
                reactNavigator("/");
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId
            });

            socketRef.current.on(
                ACTIONS.JOIN_FAILED,
                () => {
                    alert("Full capacity reached");
                    reactNavigator('/');
                }
            );

            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    console.log(`${username} joined the room.`);

                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    console.log(`${username} left the room.`);
                    setClients((prevClients) =>
                        prevClients.filter(
                            (client) => client.socketId !== socketId
                        )
                    );
                }
            );

            socketRef.current.on('disconnect', () => {
                console.log('Collaboration WebSocket disconnected');
                socketRef.current.close();
            });
        };

        if (socketRef.current === null) {
            init();
        }
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            console.log("Room ID copied to clipboard!");
        } catch (error) {
            console.log("Failed to copy room ID to clipboard!");
            console.log(error);
        }
    }

    function leaveRoom() {
        reactNavigator("/");
        socketRef.current.disconnect();
    }

    return (
        <div className={styles["container"]}>
            <nav className={styles["header"]}>
                <div className={styles["clients-list"]}>
                    {clients.map((client) => (
                        <Client
                            key={client.socketId}
                            username={client.username}
                        />
                    ))}
                </div>
                <div className={styles["btn-group"]}>
                    <button
                        className={`${styles["btn"]} ${styles["copy-btn"]}`}
                        onClick={copyRoomId}
                    >
                        Copy Room ID
                    </button>
                    <button
                        className={`${styles["btn"]} ${styles["leave-btn"]}`}
                        onClick={leaveRoom}
                    >
                        Leave Room
                    </button>
                </div>
            </nav>
            <div className={styles["main-wrap"]}>
                <div className={styles["left-column"]}>
                    <RoomQuestion roomId={roomId} />
                </div>
                <div className={styles["right-column"]}>
                    <Editor
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            codeRef.current = code;
                        }}
                    />
                    <div className={styles["bottom-section"]}>
                        <div className={styles["results-bar"]} style={{ display: resultsVisible ? 'block' : 'none' }}>
                            Results will be here
                        </div>
                        <div className={styles["execution-bar"]}>
                            <p className={styles["results-btn"]} onClick={() => setResultsVisible(!resultsVisible)}>
                                <span>Results</span>
                                {
                                    resultsVisible
                                        ? <KeyboardArrowDownIcon />
                                        : <KeyboardArrowUpIcon />
                                }
                            </p>
                            <div className={styles["btn-group"]}>
                                <button className={styles["run-btn"]}>
                                    Run
                                </button>
                                <button className={styles["submit-btn"]}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Room;
