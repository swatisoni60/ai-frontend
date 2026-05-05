import React, { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [model, setModel] = useState("phi3");
  const [currentChat, setCurrentChat] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [chats, setChats] = useState([
    { title: "New Chat", messages: [] }
  ]);

  const endRef = useRef(null);
  const fileRef = useRef(null);

  /* ---------- Load ---------- */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("ultimate_ai_chats")
    );

    if (saved && saved.length) {
      setChats(saved);
    }
  }, []);

  /* ---------- Save ---------- */
  useEffect(() => {
    localStorage.setItem(
      "ultimate_ai_chats",
      JSON.stringify(chats)
    );
  }, [chats]);

  /* ---------- Scroll ---------- */
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [chats, typing]);

  /* ---------- Ask AI ---------- */
  const askBot = async (text) => {
    const res = await fetch(
      "http://127.0.0.1:5000/api/chat/",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          message: text,
          model: model
        })
      }
    );

    const data = await res.json();
    return data.reply;
  };

  /* ---------- Send ---------- */
  const sendMessage = async () => {
    if (!message.trim()) return;

    let updated = [...chats];

    updated[currentChat].messages.push({
      user: message,
      bot: ""
    });

    if (
      updated[currentChat].title ===
      "New Chat"
    ) {
      updated[currentChat].title =
        message.slice(0, 20);
    }

    setChats([...updated]);

    const userText = message;
    setMessage("");
    setTyping(true);

    try {
      const reply = await askBot(
        userText
      );

      updated[currentChat].messages[
        updated[currentChat]
          .messages.length - 1
      ].bot = reply;

      setChats([...updated]);
    } catch {
      updated[currentChat].messages[
        updated[currentChat]
          .messages.length - 1
      ].bot =
        "Server error.";

      setChats([...updated]);
    }

    setTyping(false);
  };

  /* ---------- Retry ---------- */
  const retry = async (i) => {
    let updated = [...chats];

    const userText =
      updated[currentChat]
        .messages[i].user;

    updated[currentChat]
      .messages[i].bot =
      "Thinking...";

    setChats([...updated]);

    const reply =
      await askBot(userText);

    updated[currentChat]
      .messages[i].bot =
      reply;

    setChats([...updated]);
  };

  /* ---------- New Chat ---------- */
  const newChat = () => {
    const updated = [
      ...chats,
      {
        title: "New Chat",
        messages: []
      }
    ];

    setChats(updated);
    setCurrentChat(
      updated.length - 1
    );
  };

  /* ---------- Delete ---------- */
  const deleteChat = (i) => {
    const updated =
      chats.filter(
        (_, index) =>
          index !== i
      );

    if (!updated.length) {
      setChats([
        {
          title: "New Chat",
          messages: []
        }
      ]);
      setCurrentChat(0);
    } else {
      setChats(updated);
      setCurrentChat(0);
    }
  };

  /* ---------- Rename ---------- */
  const renameChat = (i) => {
    const name = prompt(
      "Rename Chat"
    );

    if (!name) return;

    const updated = [...chats];
    updated[i].title = name;
    setChats(updated);
  };

  /* ---------- Clear ---------- */
  const clearAll = () => {
    if (
      window.confirm(
        "Delete all chats?"
      )
    ) {
      setChats([
        {
          title: "New Chat",
          messages: []
        }
      ]);
      setCurrentChat(0);
    }
  };

  /* ---------- Export ---------- */
  const exportJSON = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          chats,
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );

    const a =
      document.createElement("a");

    a.href =
      URL.createObjectURL(blob);

    a.download =
      "chat-history.json";

    a.click();
  };

  /* ---------- Copy ---------- */
  const copyText = (txt) => {
    navigator.clipboard.writeText(
      txt
    );
  };

  /* ---------- Voice ---------- */
  const voiceInput = () => {
    const Speech =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Speech) {
      alert(
        "Voice not supported"
      );
      return;
    }

    const recog =
      new Speech();

    recog.onresult = (
      e
    ) => {
      setMessage(
        e.results[0][0]
          .transcript
      );
    };

    recog.start();
  };

  /* ---------- File Upload ---------- */
  const uploadFile = (e) => {
    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (
      event
    ) => {
      setMessage(
        event.target.result.slice(
          0,
          3000
        )
      );
    };

    reader.readAsText(file);
  };

  const filtered =
    chats.filter((chat) =>
      chat.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div style={wrap}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div style={sidebar}>
          <h2>
            ✨ AI Chats
          </h2>

          <button
            onClick={newChat}
            style={greenBtn}
          >
            + New Chat
          </button>

          <button
            onClick={clearAll}
            style={{
              ...redBtn,
              marginTop: 10
            }}
          >
            Clear
          </button>

          <button
            onClick={
              exportJSON
            }
            style={{
              ...grayBtn,
              marginTop: 10
            }}
          >
            Export
          </button>

          <input
            placeholder="Search..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              ...inputBox,
              marginTop: 14
            }}
          />

          <div
            style={{
              marginTop: 14
            }}
          >
            {filtered.map(
              (
                chat,
                i
              ) => {
                const real =
                  chats.indexOf(
                    chat
                  );

                return (
                  <div
                    key={i}
                    onClick={() =>
                      setCurrentChat(
                        real
                      )
                    }
                    style={{
                      ...chatCard,
                      background:
                        real ===
                        currentChat
                          ? "#2563eb"
                          : "#1e293b"
                    }}
                  >
                    {
                      chat.title
                    }

                    <div
                      style={{
                        marginTop: 8
                      }}
                    >
                      <button
                        style={
                          miniBtn
                        }
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();
                          renameChat(
                            real
                          );
                        }}
                      >
                        ✏
                      </button>

                      <button
                        style={
                          miniBtn
                        }
                        onClick={(
                          e
                        ) => {
                          e.stopPropagation();
                          deleteChat(
                            real
                          );
                        }}
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Main */}
      <div style={main}>
        {/* Header */}
        <div style={header}>
          <button
            onClick={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            style={
              miniBtn
            }
          >
            ☰
          </button>

          <span
            style={{
              marginLeft: 12
            }}
          >
            🤖 Final Pro AI
          </span>

          <select
            value={model}
            onChange={(e) =>
              setModel(
                e.target.value
              )
            }
            style={{
              marginLeft:
                "auto",
              padding:
                "8px",
              borderRadius:
                "8px",
              background:
                "#1e293b",
              color:
                "white"
            }}
          >
            <option value="phi3">
              phi3
            </option>
            <option value="llama3">
              llama3
            </option>
            <option value="mistral">
              mistral
            </option>
          </select>
        </div>

        {/* Messages */}
        <div style={messages}>
          {(chats[currentChat]
            ?.messages || []
          ).map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom:
                  24
              }}
            >
              <div
                style={{
                  textAlign:
                    "right"
                }}
              >
                <span
                  style={
                    userBubble
                  }
                >
                  👤{" "}
                  {
                    msg.user
                  }
                </span>
              </div>

              <div
                style={{
                  marginTop:
                    10
                }}
              >
                <span
                  style={
                    botBubble
                  }
                >
                  🤖{" "}
                  {
                    msg.bot
                  }
                </span>

                <div
                  style={{
                    marginTop: 8
                  }}
                >
                  <button
                    onClick={() =>
                      copyText(
                        msg.bot
                      )
                    }
                    style={
                      miniBtn
                    }
                  >
                    Copy
                  </button>

                  <button
                    onClick={() =>
                      retry(i)
                    }
                    style={
                      miniBtn
                    }
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div>
              ⚡ Thinking...
            </div>
          )}

          <div ref={endRef}></div>
        </div>

        {/* Input */}
        <div style={inputWrap}>
          <input
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={(e) =>
              e.key ===
                "Enter" &&
              sendMessage()
            }
            placeholder="Ask anything..."
            style={inputBox}
          />

          <input
            type="file"
            ref={fileRef}
            onChange={
              uploadFile
            }
            style={{
              display:
                "none"
            }}
          />

          <button
            onClick={() =>
              fileRef.current.click()
            }
            style={grayBtn}
          >
            📁
          </button>

          <button
            onClick={
              voiceInput
            }
            style={grayBtn}
          >
            🎤
          </button>

          <button
            onClick={
              sendMessage
            }
            style={greenBtn}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const wrap = {
  display: "flex",
  height: "100vh",
  background:
    "linear-gradient(135deg,#0f172a,#111827,#1e293b)",
  color: "white",
  fontFamily:
    "Segoe UI"
};

const sidebar = {
  width: "310px",
  padding: "20px",
  background:
    "rgba(255,255,255,0.04)",
  borderRight:
    "1px solid rgba(255,255,255,0.06)",
  overflowY: "auto"
};

const main = {
  flex: 1,
  display: "flex",
  flexDirection:
    "column"
};

const header = {
  display: "flex",
  alignItems:
    "center",
  padding: "18px",
  fontSize: "22px",
  fontWeight: "bold",
  borderBottom:
    "1px solid rgba(255,255,255,0.06)"
};

const messages = {
  flex: 1,
  padding: "20px",
  overflowY: "auto"
};

const inputWrap = {
  display: "flex",
  gap: "10px",
  padding: "18px",
  borderTop:
    "1px solid rgba(255,255,255,0.06)"
};

const inputBox = {
  flex: 1,
  padding: "14px",
  borderRadius:
    "12px",
  border: "none",
  outline: "none",
  background:
    "rgba(255,255,255,0.05)",
  color: "white"
};

const greenBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius:
    "12px",
  background:
    "#22c55e",
  color: "white",
  cursor: "pointer"
};

const redBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius:
    "12px",
  background:
    "#ef4444",
  color: "white",
  cursor: "pointer"
};

const grayBtn = {
  padding: "12px 18px",
  border: "none",
  borderRadius:
    "12px",
  background:
    "#334155",
  color: "white",
  cursor: "pointer"
};

const miniBtn = {
  padding: "6px 10px",
  border: "none",
  borderRadius:
    "8px",
  background:
    "#334155",
  color: "white",
  cursor: "pointer",
  marginRight: 6
};

const chatCard = {
  padding: "12px",
  borderRadius:
    "12px",
  marginBottom:
    "10px",
  cursor: "pointer"
};

const userBubble = {
  background:
    "#2563eb",
  padding:
    "10px 14px",
  borderRadius:
    "14px",
  display:
    "inline-block"
};

const botBubble = {
  background:
    "rgba(255,255,255,0.06)",
  padding:
    "10px 14px",
  borderRadius:
    "14px",
  display:
    "inline-block",
  whiteSpace:
    "pre-wrap",
  maxWidth:
    "75%"
};