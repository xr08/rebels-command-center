const { useState, useEffect } = React;

// Setup Lucide icons using window.lucide
// We have to build our own Icon component since lucide-react UMD isn't loaded (only lucide core)
const Icon = ({ name, size = 24, color = 'currentColor', className = '' }) => {
    const iconRef = React.useRef(null);

    React.useEffect(() => {
        if (iconRef.current && window.lucide && window.lucide.icons[name]) {
            // clear existing
            iconRef.current.innerHTML = '';

            // Create SVG element using lucide
            const svgAttrs = {
                width: size,
                height: size,
                stroke: color,
                'stroke-width': 2,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                fill: 'none',
                class: `lucide lucide-${name} ${className}`
            };

            const svgString = `<svg ${Object.entries(svgAttrs).map(([k, v]) => `${k}="${v}"`).join(' ')}>${window.lucide.icons[name].join('')}</svg>`;
            iconRef.current.innerHTML = svgString;
        }
    }, [name, size, color, className]);

    return <span ref={iconRef} className={`inline-flex items-center justify-center ${className}`} />;
};

const TechnicalVault = () => {
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');
    const [techData, setTechData] = useState(null);
    const [envData, setEnvData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({});

    useEffect(() => {
        const loadTechData = async () => {
            try {
                const techRes = await fetch('TECHNICAL.md');
                if (techRes.ok) {
                    const techText = await techRes.text();
                    setTechData(JSON.parse(techText));
                }
            } catch (err) {
                console.error("Failed to fetch local configs:", err);
            }
        };
        loadTechData();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');

        try {
            const res = await fetch('/.netlify/functions/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput })
            });

            if (res.ok) {
                const data = await res.json();
                setEnvData(data);
                setIsAuthenticated(true);
            } else {
                setAuthError('Incorrect Master Password');
            }
        } catch (err) {
            console.error("Auth error:", err);
            setAuthError('Network error trying to authenticate.');
        } finally {
            setLoading(false);
        }
    };



    const togglePassword = (key) => {
        setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const CredentialRow = ({ label, value, id, isPassword = true }) => {
        if (!isPassword) {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--rebels-gold)' }}>{value}</span>
                        <button className="action-icon-btn" style={{ padding: '0.25rem' }} onClick={() => navigator.clipboard.writeText(value)} title="Copy Value">
                            <Icon name="Copy" size={16} />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">{label}</label>
                <div className="input-with-action">
                    <input
                        type={showPassword[id] ? "text" : "password"}
                        className="form-input"
                        value={value || ""}
                        readOnly
                    />
                    <button className="action-icon-btn" onClick={() => togglePassword(id)} title="Toggle Visibility">
                        <Icon name={showPassword[id] ? "EyeOff" : "Eye"} size={18} />
                    </button>
                    <button className="action-icon-btn" onClick={() => navigator.clipboard.writeText(value)} title="Copy Value">
                        <Icon name="Copy" size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const SimpleRow = ({ label, value, isCode }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontFamily: isCode ? 'monospace' : 'inherit', color: isCode ? 'var(--rebels-gold)' : 'var(--rebels-white)' }}>{value}</span>
        </div>
    );

    if (!isAuthenticated) return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <Icon name="LockKeyhole" size={48} color="var(--rebels-gold)" style={{ marginBottom: '1rem' }} />
                <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Secure Vault Access</h3>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Enter the master password to view sensitive club credentials.</p>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Master Password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Unlock Vault'}
                    </button>
                    {authError && <p style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>{authError}</p>}
                </form>
            </div>
        </div>
    );

    return (
        <div className="grid grid-2">
            <div className="grid" style={{ gap: '1.5rem', gridTemplateColumns: '1fr' }}>
                <div className="card">
                    <div className="card-header">
                        <Icon name="Wifi" className="card-icon" />
                        <h3 className="card-title">Dugout Hub (GL-BE3600)</h3>
                    </div>
                    <CredentialRow label="Router IP" value={envData.VITE_ROUTER2_IP} id="dugout_ip" isPassword={false} />
                    <CredentialRow label="Admin Password" value={envData.VITE_ROUTER2_ADMIN_PASSWORD} id="dugout_admin" />
                    <CredentialRow label="Wi-Fi SSID" value={envData.VITE_ROUTER2_SSID} id="dugout_ssid" isPassword={false} />
                    <CredentialRow label="Wi-Fi Password" value={envData.VITE_ROUTER2_WIFI_KEY} id="dugout_wifi_pass" />
                    <div style={{ marginTop: '1rem' }}>
                        <CredentialRow label="MAC Address" value={envData.VITE_ROUTER2_MAC} id="dugout_mac" isPassword={false} />
                        <CredentialRow label="Serial" value={envData.VITE_ROUTER2_SN} id="dugout_serial" isPassword={false} />
                        <CredentialRow label="Device ID" value={envData.VITE_ROUTER2_DEVICE_ID} id="dugout_device_id" isPassword={false} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <Icon name="Lock" className="card-icon" />
                        <h3 className="card-title">Global Accounts</h3>
                    </div>
                    <CredentialRow label="Rebels Global Email" value={envData.VITE_CLUB_EMAIL} id="global_email" isPassword={false} />
                    <CredentialRow label="Global Password" value={envData.VITE_CLUB_PASSWORD} id="global_pass" />
                    <CredentialRow label="ISP Account Holder" value={envData.VITE_INTERNET_ACCOUNT} id="isp" isPassword={false} />
                    <CredentialRow label="Social Media Admin" value={envData.VITE_SOCIAL_MEDIA_ADMIN} id="social_admin" isPassword={false} />
                </div>

                <div className="card">
                    <div className="card-header">
                        <Icon name="Camera" className="card-icon" />
                        <h3 className="card-title">Camera Network</h3>
                    </div>
                    <CredentialRow label="Nearstream VM33 IP" value={envData.VITE_CAM1_IP} id="vm33_ip" isPassword={false} />
                    <CredentialRow label="Nearstream VM46 (1) IP" value={envData.VITE_CAM2_IP} id="vm46_ip" isPassword={false} />
                    <CredentialRow label="Nearstream VM46 (2) IP" value={envData.VITE_CAM3_IP} id="vm46new_ip" isPassword={false} />
                </div>

                <div className="card">
                    <div className="card-header">
                        <Icon name="Wifi" className="card-icon" />
                        <h3 className="card-title">Netgear 5G Hub (M7 Ultra)</h3>
                    </div>
                    <CredentialRow label="Router IP" value={envData.VITE_MODEM_IP} id="modem_ip" isPassword={false} />
                    <CredentialRow label="Wi-Fi SSID" value={envData.VITE_MODEM_SSID} id="modem_ssid" isPassword={false} />
                    <CredentialRow label="Wi-Fi Password" value={envData.VITE_MODEM_WIFI_KEY} id="modem_wifi_pass" />
                    <div style={{ marginTop: '1rem' }}>
                        <CredentialRow label="MAC Address" value={envData.VITE_MODEM_MAC} id="modem_mac" isPassword={false} />
                        <CredentialRow label="IMEI" value={envData.VITE_MODEM_IMEI} id="modem_imei" isPassword={false} />
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gap: '1.5rem', gridTemplateColumns: '1fr' }}>

                <div className="card">
                    <div className="card-header">
                        <Icon name="Wifi" className="card-icon" />
                        <h3 className="card-title">Centerfield Bridge (GL-AXT1800)</h3>
                    </div>
                    <CredentialRow label="Router IP" value={envData.VITE_ROUTER1_IP} id="cf_ip" isPassword={false} />
                    <CredentialRow label="Admin Password" value={envData.VITE_ROUTER1_ADMIN_PASSWORD} id="cf_admin" />
                    <CredentialRow label="Wi-Fi SSID" value={envData.VITE_ROUTER1_SSID} id="cf_ssid" isPassword={false} />
                    <CredentialRow label="Wi-Fi Password" value={envData.VITE_ROUTER1_WIFI_KEY} id="cf_wifi_pass" />
                    <div style={{ marginTop: '1rem' }}>
                        <CredentialRow label="MAC Address" value={envData.VITE_ROUTER1_MAC} id="cf_mac" isPassword={false} />
                        <CredentialRow label="Serial" value={envData.VITE_ROUTER1_SN} id="cf_serial" isPassword={false} />
                        <CredentialRow label="Device ID" value={envData.VITE_ROUTER1_DEVICE_ID} id="cf_device_id" isPassword={false} />
                    </div>
                </div>



                <div className="card">
                    <div className="card-header">
                        <Icon name="Video" className="card-icon" />
                        <h3 className="card-title">Equipment Inventory</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {techData?.equipment_inventory ? (() => {
                            const groups = { 'Cameras': [], 'Wi-Fi': [], 'Modems': [], 'Tripods': [], 'USB Items': [], 'Tablets': [], 'Power': [], 'Misc': [] };
                            techData.equipment_inventory.forEach(item => {
                                const desc = (item.description || '').toLowerCase();
                                const brand = (item.brand || '').toLowerCase();
                                if (brand.includes('nearstream')) groups['Cameras'].push(item);
                                else if (brand.includes('gl-inet')) groups['Wi-Fi'].push(item);
                                else if (brand.includes('netgear') || desc.includes('modem')) groups['Modems'].push(item);
                                else if (desc.includes('tripod')) groups['Tripods'].push(item);
                                else if (desc.includes('usb')) groups['USB Items'].push(item);
                                else if (desc.includes('tablet')) groups['Tablets'].push(item);
                                else if (desc.includes('power') || desc.includes('solar')) groups['Power'].push(item);
                                else groups['Misc'].push(item);
                            });

                            return Object.entries(groups).filter(([_, items]) => items.length > 0).map(([category, items]) => (
                                <div key={category}>
                                    <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>{category}</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {items.map((item, idx) => (
                                            <SimpleRow
                                                key={idx}
                                                label={`${item.brand} ${item.model ? item.model + ' ' : ''}${item.description}`}
                                                value={""}
                                                isCode={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ));
                        })() : <p>No equipment data found.</p>}
                    </div>
                </div>
            </div>

            {Object.keys(envData).length === 0 && (
                <div style={{ gridColumn: '1 / -1', background: 'rgba(255, 0, 0, 0.2)', border: '1px solid red', padding: '1rem', borderRadius: '8px', color: 'white', marginTop: '1rem' }}>
                    <strong>Warning:</strong> No data loaded from <code>.env</code> file. The Vault credentials will appear empty. Please ensure the file exists in the root directory and is served correctly.
                </div>
            )}

            <div className="card" style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
                <div className="card-header">
                    <Icon name="MapPin" className="card-icon" />
                    <h3 className="card-title">Venues & Setups Guide</h3>
                </div>
                <div className="grid grid-2">
                    <div>
                        <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.75rem' }}>Shirley Strickland Reserve</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {techData?.venues?.filter(v => v.type === "Home Ground").map(v => (
                                <div key={v.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <strong>{v.name}</strong>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{v.description} {v.backnet_type}.</p>
                                    <div className={`badge ${v.recommended_setup.includes('3_camera') ? 'badge-gold' : 'badge-green'}`} style={{ marginTop: '0.5rem' }}>Rec Setup: {techData.setups.find(s => s.id === v.recommended_setup)?.name || v.recommended_setup}</div>
                                </div>
                            ))}
                        </div>

                        <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.75rem' }}>Away Grounds</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {techData?.venues?.filter(v => v.type === "Away Ground").map(v => (
                                <div key={v.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                    <strong>{v.name}</strong>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{v.description} {v.backnet_type}. {v.has_240v_power && "240v Power available."}</p>
                                    <div className={`badge ${v.recommended_setup.includes('3_camera') ? 'badge-gold' : 'badge-green'}`} style={{ marginTop: '0.5rem' }}>Rec Setup: {techData.setups.find(s => s.id === v.recommended_setup)?.name || v.recommended_setup}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.75rem' }}>Broadcast Setups</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {techData?.setups?.map(s => (
                                <div key={s.id} style={{ background: s.id === '3_camera_cf' ? 'rgba(4, 66, 41, 0.4)' : 'rgba(255,255,255,0.05)', border: s.id === '3_camera_cf' ? '1px solid var(--rebels-gold)' : 'none', padding: '0.75rem', borderRadius: '8px' }}>
                                    <strong>{s.name}</strong>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>{s.camera_placement}</p>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Staff: {s.staffing.setup} Setup, {s.staffing.operating} Operating, {s.staffing.score} Score</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TroubleshootingSOS = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [knowledge, setKnowledge] = useState([]);
    const [rules, setRules] = useState('');
    const [envData, setEnvData] = useState({});

    const [chat, setChat] = useState([
        { sender: 'ai', text: 'Rebels Technical Assistant online. Reference files loaded. What can I help you with today?' }
    ]);
    const [chatInput, setChatInput] = useState('');

    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const loadAI = async () => {
            try {
                const [kbRes, rulesRes, envRes] = await Promise.all([
                    fetch('AI_KNOWLEDGE.md'), fetch('AI_RULES.md'), fetch('.env')
                ]);
                if (kbRes.ok) {
                    const kbText = await kbRes.text();
                    setKnowledge(kbText); // Passing full markdown text directly to Gemini
                }
                if (rulesRes.ok) {
                    setRules(await rulesRes.text());
                }
                if (kbRes.ok) {
                    const kbText = await kbRes.text();
                    setKnowledge(kbText);
                }
                if (rulesRes.ok) {
                    setRules(await rulesRes.text());
                }
            } catch (err) {
                console.error("Failed to load AI data:", err);
            }
        };
        loadAI();
    }, []);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isTyping) return;

        const userMsg = chatInput.trim();
        setChat(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userMsg: userMsg,
                    knowledge: knowledge,
                    rules: rules
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setChat(prev => [...prev, { sender: 'ai', text: data.error || "I was unable to retrieve a response from the Rebels database." }]);
                return;
            }

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to retrieve a response from the Rebels database.";
            setChat(prev => [...prev, { sender: 'ai', text: replyText }]);

        } catch (error) {
            console.error("Gemini API Error:", error);
            setChat(prev => [...prev, { sender: 'ai', text: "Network error connecting to the Rebels Support Server." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const [fixes, setFixes] = useState([]);

    useEffect(() => {
        if (typeof knowledge === 'string' && knowledge.trim() !== '') {
            const parsedFixes = [];
            const lines = knowledge.split('\n');
            let currentTitle = '';
            let currentDesc = '';

            for (const line of lines) {
                if (line.startsWith('## ')) {
                    if (currentTitle) {
                        parsedFixes.push({ title: currentTitle, desc: currentDesc.trim() });
                    }
                    currentTitle = line.replace('## ', '').trim();
                    currentDesc = '';
                } else if (currentTitle && line.trim() !== '' && !line.startsWith('#')) {
                    currentDesc += line + '\n';
                }
            }
            if (currentTitle) {
                parsedFixes.push({ title: currentTitle, desc: currentDesc.trim() });
            }
            setFixes(parsedFixes);
        }
    }, [knowledge]);

    const filteredFixes = fixes.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    const [activeFixIndex, setActiveFixIndex] = useState(null);

    const toggleFix = (index) => {
        setActiveFixIndex(activeFixIndex === index ? null : index);
    };

    return (
        <div className="grid grid-2">
            <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="card">
                    <div className="card-header">
                        <Icon name="Search" className="card-icon" />
                        <h3 className="card-title">Common Fixes Guide</h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Search issues like 'No Audio'..."
                        className="form-input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredFixes.map((f, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => toggleFix(i)}
                                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--rebels-gold)', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}
                                >
                                    {f.title}
                                    <Icon name={activeFixIndex === i ? "ChevronUp" : "ChevronDown"} size={20} />
                                </button>
                                {activeFixIndex === i && (
                                    <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.875rem', color: 'var(--text-primary)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        {f.desc}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="card-header">
                    <Icon name="MessageSquare" className="card-icon" />
                    <h3 className="card-title">AI Support Chat</h3>
                </div>
                <div className="chat-window" style={{ flex: 1, minHeight: '400px', marginBottom: '1rem' }}>
                    {chat.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Type your issue..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                        <Icon name="Send" size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

const BrandIdentity = () => {
    const heritageFacts = [
        "Proudly established in 1984.",
        "Home of 24 Australian representatives.",
        "Located at Shirley Strickland Reserve.",
        "Fostering a safe, inclusive, and encouraging environment for all 10 junior teams."
    ];

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    return (
        <div className="grid grid-2">
            <div className="card">
                <div className="card-header">
                    <Icon name="BookOpen" className="card-icon" />
                    <h3 className="card-title">Rebels Heritage Facts</h3>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>One-tap copy for stream descriptions or commentator reads.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {heritageFacts.map((fact, i) => (
                        <div key={i} style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', lineHeight: '1.4' }}>{fact}</span>
                            <button className="action-icon-btn" onClick={() => copyToClipboard(fact)} title="Copy Fact">
                                <Icon name="Copy" size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div className="card">
                    <div className="card-header">
                        <Icon name="Link" className="card-icon" />
                        <h3 className="card-title">Official Links</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="input-with-action">
                            <input type="text" className="form-input" value="https://fremantlerebels.com.au" readOnly />
                            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => copyToClipboard('https://fremantlerebels.com.au')}>Copy</button>
                        </div>
                        <div className="input-with-action">
                            <input type="text" className="form-input" value="https://youtube.com/@fremantlerebels" readOnly />
                            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => copyToClipboard('https://youtube.com/@fremantlerebels')}>Copy</button>
                        </div>
                        <div className="input-with-action">
                            <input type="text" className="form-input" value="https://facebook.com/fremantlerebels" readOnly />
                            <button className="btn btn-secondary" style={{ padding: '0 1rem' }} onClick={() => copyToClipboard('https://facebook.com/fremantlerebels')}>Copy</button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <Icon name="Star" className="card-icon" />
                        <h3 className="card-title">Sponsor Scroll Planner</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Ensure these partners are mentioned during innings breaks.</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="https://redskycaravans.com.au" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                            <img src="./assets/redsky wide.jpg" alt="Redsky Caravans" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </a>
                        <a href="https://ibisfurniture.com.au" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                            <img src="./assets/ibis.jpg" alt="Ibis Furnature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </a>
                        <a href="https://bruceaverytransport.com.au" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                            <img src="./assets/BAT Logo (3) - Copy.jpg" alt="Bruce Avery Transport" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </a>
                        <a href="https://tjm.com.au" target="_blank" rel="noopener noreferrer" className="badge badge-gold" style={{ alignSelf: 'center', textDecoration: 'none', color: 'var(--text-primary)', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                            TJM 4x4 Equipped
                        </a>
                        <a href="https://forceemeco.com.au" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', padding: '0.5rem', borderRadius: '4px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                            <img src="./assets/force emeco - Copy.jpg" alt="Force Emeco" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StreamPlanning = () => {
    const [segment, setSegment] = useState('junior');

    const templates = {
        junior: "Calling all future stars! 🌟 The Fremantle Rebels 'Come & Try Day' is happening next weekend at Shirley Strickland Reserve. Perfect for kids wanting to try softball in a safe, fun, and inclusive environment. Grab a glove and join the Rebels family!",
        interview: "We're here with the Player of the Match. Talk us through that incredible play in the 4th inning... how does it feel to get the win for the Rebels today at Shirley Strickland Reserve?",
        commentary: "And that's a classic Rebels play! Just a reminder to all our viewers, we have 24 Australian representatives that have come through this very club. The pathway to the elite level starts right here on this diamond."
    };

    const prompts = [
        "Commentator: 'Where is everyone tuning in from today? Let us know in the chat!'",
        "Commentator: 'Who is your pick for MVP this game? Drop a name below!'",
        "Commentator: 'Hit the like button if you want to see a Rebels home run this inning!'"
    ];

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    return (
        <div className="grid grid-2">
            <div className="card">
                <div className="card-header">
                    <Icon name="CalendarHeart" className="card-icon" />
                    <h3 className="card-title">Segment Planner</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button className={`btn ${segment === 'junior' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSegment('junior')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Junior Promo</button>
                    <button className={`btn ${segment === 'interview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSegment('interview')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Player Interview</button>
                    <button className={`btn ${segment === 'commentary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSegment('commentary')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Commentary</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', minHeight: '120px', flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--rebels-white)' }}>{templates[segment]}</p>
                    </div>
                    {segment === 'junior' && (
                        <div style={{ flex: '0 0 250px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '1px dashed var(--card-border)' }}>
                            <Icon name="PlayCircle" size={32} color="var(--rebels-gold)" />
                            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>junior-promo.mp4</span>
                        </div>
                    )}
                </div>
                <button className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }} onClick={() => copyToClipboard(templates[segment])}>
                    <Icon name="Copy" size={16} /> Copy Script
                </button>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                    <Icon name="MessageCircle" className="card-icon" />
                    <h3 className="card-title">Live Engagement Prompts</h3>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Read these on-air to boost YouTube algorithm engagement.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {prompts.map((prompt, i) => (
                        <div key={i} style={{ padding: '0.875rem', background: 'rgba(18, 94, 52, 0.2)', borderLeft: '4px solid var(--rebels-gold)', borderRadius: '0 8px 8px 0', fontSize: '0.875rem', color: 'var(--rebels-white)' }}>
                            {prompt}
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} onClick={() => copyToClipboard(prompts.join('\n\n'))}>
                    <Icon name="Copy" size={16} /> Copy All Prompts
                </button>
            </div>
        </div>
    );
};

const AnalyticsPostGame = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Report submitted successfully to the club committee!');
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <div className="grid">
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <div className="card-header">
                    <Icon name="FileText" className="card-icon" />
                    <h3 className="card-title">Post-Game Report</h3>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Log viewership and technical lessons to help improve future broadcasts.</p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Game Date / Opponent</label>
                            <input type="text" className="form-input" placeholder="e.g. 24 Oct vs. Redbacks" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Peak Concurrent Viewers</label>
                            <input type="number" className="form-input" placeholder="e.g. 150" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Total Views (End of Broadcast)</label>
                        <input type="number" className="form-input" placeholder="e.g. 1200" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Technical Issues & Lessons Learned</label>
                        <textarea className="form-input" rows="4" placeholder="e.g. The Wi-Fi dropped in the 3rd inning due to crowds. Next time we will exclusively use the Telstra 5G hotspot." required></textarea>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary">Submit Report</button>
                        {status && <span style={{ color: '#4ade80', fontSize: '0.875rem', fontWeight: '500' }}>{status}</span>}
                    </div>
                </form>
            </div>
        </div>
    );
};

const GameDaySetup = () => {
    const [step, setStep] = useState(1);
    const [techData, setTechData] = useState(null);
    const [envData, setEnvData] = useState({});
    const [knowledge, setKnowledge] = useState('');
    const [rules, setRules] = useState('');

    const [checklist, setChecklist] = useState({
        battery: false, signal: false, tripod: false, audio: false, privacy: false
    });
    const toggleCheck = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    const allChecked = Object.values(checklist).every(Boolean);

    const [selectedGround, setSelectedGround] = useState('');
    const [selectedVenueObj, setSelectedVenueObj] = useState(null);
    const [selectedSetupObj, setSelectedSetupObj] = useState(null);

    const [chat, setChat] = useState([
        { sender: 'ai', text: 'Setup checklist active. What hardware are you currently looking at, or what do you need help connecting?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const loadInfo = async () => {
            try {
                const [techRes, envRes, kbRes, rulesRes] = await Promise.all([
                    fetch('TECHNICAL.md'), fetch('.env'), fetch('AI_KNOWLEDGE.md'), fetch('AI_RULES.md')
                ]);
                if (techRes.ok) setTechData(await techRes.json());
                if (kbRes.ok) setKnowledge(await kbRes.text());
                if (rulesRes.ok) setRules(await rulesRes.text());
            } catch (err) {
                console.error("Failed to load setup data:", err);
            }
        };
        loadInfo();
    }, []);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isTyping) return;

        const userMsg = chatInput.trim();
        setChat(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const systemPrompt = `You are the Setup Assistant. The user is setting up at ${selectedVenueObj?.name} using the ${selectedSetupObj?.name}. Assume they need guidance. Focus your answers entirely on the physical setup.`;

            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userMsg: userMsg,
                    knowledge: knowledge,
                    rules: systemPrompt + "\n" + rules
                })
            });

            const data = await response.json();
            if (!response.ok) {
                setChat(prev => [...prev, { sender: 'ai', text: data.error || "Error retrieving response." }]);
                return;
            }

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error retrieving response.";
            setChat(prev => [...prev, { sender: 'ai', text: replyText }]);
        } catch (error) {
            setChat(prev => [...prev, { sender: 'ai', text: "Network error connecting to AI." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!techData) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--rebels-gold)' }}>Loading Setup Wizard...</div>;

    const grounds = [...new Set(techData.venues.map(v => v.name.split(' - ')[0]))];
    const diamondsForGround = selectedGround ? techData.venues.filter(v => v.name.startsWith(selectedGround)) : [];

    return (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto', gridColumn: '1 / -1' }}>
            <div className="card-header" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <Icon name="PlayCircle" className="card-icon" />
                <h3 className="card-title">Game Day Setup Wizard</h3>
            </div>

            {step === 1 && (
                <div>
                    <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '1rem' }}>Step 1: Select Ground</h4>
                    <div className="grid grid-2">
                        {grounds.map(g => (
                            <button key={g} className="btn btn-secondary" style={{ padding: '2rem', fontSize: '1.2rem', textAlign: 'center' }} onClick={() => { setSelectedGround(g); setStep(2); }}>
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => setStep(1)}>&larr; Back to Grounds</button>
                    <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '1rem' }}>Step 2: Select Diamond at {selectedGround}</h4>
                    <div className="grid grid-2">
                        {diamondsForGround.map(v => (
                            <div key={v.id} className="card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', cursor: 'pointer' }} onClick={() => { setSelectedVenueObj(v); setStep(3); }}>
                                <strong style={{ fontSize: '1.2rem' }}>{v.name.split(' - ')[1] || v.name}</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{v.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <button className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => setStep(2)}>&larr; Back to Diamonds</button>
                    <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '1rem' }}>Step 3: Select Camera Setup</h4>
                    <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Recommended for this diamond: <strong style={{ color: 'var(--rebels-gold)' }}>{techData.setups.find(s => s.id === selectedVenueObj.recommended_setup)?.name || 'N/A'}</strong></p>
                    <div className="grid grid-2">
                        {techData.setups.map(s => (
                            <div key={s.id} className="card" style={{ background: s.id === selectedVenueObj.recommended_setup ? 'rgba(4, 66, 41, 0.4)' : 'rgba(0,0,0,0.2)', border: s.id === selectedVenueObj.recommended_setup ? '1px solid var(--rebels-gold)' : '1px solid var(--card-border)', cursor: 'pointer' }} onClick={() => { setSelectedSetupObj(s); setStep(4); }}>
                                <strong>{s.name}</strong>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{s.camera_placement}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <button className="btn btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => setStep(3)}>&larr; Change Setup</button>

                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.5rem' }}>Active Setup: {selectedSetupObj.name}</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Location: {selectedVenueObj.name}</p>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <h5 style={{ marginBottom: '0.5rem', color: 'var(--rebels-white)' }}>Required Equipment:</h5>
                                <ul style={{ fontSize: '0.875rem', margin: '0', paddingLeft: '1.2rem', color: 'var(--text-primary)' }}>
                                    {Object.entries(selectedSetupObj.equipment_counts).filter(([_, count]) => count > 0).map(([key, count]) => (
                                        <li key={key} style={{ marginBottom: '0.25rem' }}>{count}x {key.replace('_', ' ').toUpperCase()}</li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <h5 style={{ marginBottom: '0.5rem', color: 'var(--rebels-white)' }}>Venue Notes:</h5>
                                <p style={{ fontSize: '0.875rem', margin: '0', color: 'var(--text-primary)' }}>{selectedVenueObj.backnet_type}. {selectedVenueObj.has_240v_power ? '240v Power available.' : 'No 240v Power - Use Powerbanks.'}</p>
                            </div>

                            <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                <h5 style={{ marginBottom: '1rem', color: 'var(--rebels-white)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icon name="CheckSquare" size={18} /> Pre-Flight Checklist
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {Object.entries({
                                        battery: "1. Battery life (iPad > 80%, Camera Full)",
                                        signal: "2. Signal strength (5G Hotspot > 3 bars)",
                                        tripod: "3. Tripod stability (Weighted down & locked)",
                                        audio: "4. Audio levels (Test mic, verify green bars)",
                                        privacy: "5. Privacy settings (Stream set to 'Public')"
                                    }).map(([key, label]) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={checklist[key]}
                                                onChange={() => toggleCheck(key)}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--rebels-gold)' }}
                                            />
                                            <span style={{ color: checklist[key] ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: checklist[key] ? 'line-through' : 'none', fontSize: '0.875rem' }}>
                                                {label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {allChecked && <div className="badge badge-green" style={{ marginTop: '1rem' }}>Ready to Broadcast!</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '1rem' }}>Interactive Setup Assistant</h4>
                            <div className="chat-window" style={{ flex: 1, minHeight: '300px', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '1rem', overflowY: 'auto' }}>
                                {chat.map((msg, idx) => (
                                    <div key={idx} className={`chat-bubble ${msg.sender}`}>
                                        {msg.text}
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="I'm connecting the modem, what's next?"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
                                    <Icon name="Send" size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MediaAssetHub = () => {
    return (
        <div className="grid">
            <div className="card">
                <div className="card-header">
                    <Icon name="MonitorPlay" className="card-icon" />
                    <h3 className="card-title">Broadcast Media Assets</h3>
                </div>
                <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>These files are located in the local <code>/assets</code> folder. Load these directly into OBS or your iPad switcher.</p>

                <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.75rem' }}>Sponsor Logos & Graphics</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                        <img src="./assets/redsky wide.jpg" alt="Redsky Caravans" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem', background: '#fff', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', margin: '0.5rem 0', textAlign: 'center' }}>Redsky Caravans</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                        <img src="./assets/ibis.jpg" alt="Ibis Furnature" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem', background: '#fff', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', margin: '0.5rem 0', textAlign: 'center' }}>Ibis Furnature</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                        <img src="./assets/BAT Logo (3) - Copy.jpg" alt="Bruce Avery Transport" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem', background: '#fff', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', margin: '0.5rem 0', textAlign: 'center', maxWidth: '120px' }}>Bruce Avery Transport</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                        <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem' }}>
                            <Icon name="Image" size={32} color="var(--text-secondary)" style={{ margin: '0 auto' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', margin: '0.5rem 0', textAlign: 'center', maxWidth: '120px' }}>TJM 4x4 Equipped<br /><span style={{ color: 'var(--text-secondary)' }}>(Pending Graphic)</span></span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px' }}>
                        <img src="./assets/force emeco - Copy.jpg" alt="Force Emeco" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem', background: '#fff', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.75rem', margin: '0.5rem 0', textAlign: 'center' }}>Force Emeco</span>
                    </div>
                </div>

                <h4 style={{ color: 'var(--rebels-gold)', marginBottom: '0.75rem' }}>Promo Videos</h4>
                <div className="grid grid-2">
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                            <Icon name="Video" size={48} color="var(--rebels-gold)" />
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Junior Come & Try Day</strong>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>junior-promo.mp4 (15 sec)</p>
                        </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                            <Icon name="Video" size={48} color="var(--rebels-gold)" />
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                            <strong style={{ fontSize: '0.875rem' }}>Rebels 1984 Intro Sting</strong>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>rebels-intro.mp4 (5 sec)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [activeTab, setActiveTab] = useState('vault');

    useEffect(() => {
        // Initialize icons after render
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'vault':
                return <TechnicalVault />;
            case 'troubleshoot':
                return <TroubleshootingSOS />;
            case 'setup':
                return <GameDaySetup />;
            case 'brand':
                return <BrandIdentity />;
            case 'planning':
                return <StreamPlanning />;
            case 'media':
                return <MediaAssetHub />;
            case 'analytics':
                return <AnalyticsPostGame />;
            default:
                return <div>Select a module</div>;
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="brand-section">
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <img src="./assets/rebels logo transparent.png" alt="Rebels Shield Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                    </div>
                    <div className="est-badge">EST. 1984</div>
                    <h1>Rebels<br />Softball</h1>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Live Stream Command Center</p>
                </div>

                <nav className="nav-menu">
                    <button className={`nav-item ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}>
                        <Icon name="Database" size={20} />
                        Tech Vault
                    </button>
                    <button className={`nav-item ${activeTab === 'troubleshoot' ? 'active' : ''}`} onClick={() => setActiveTab('troubleshoot')}>
                        <Icon name="LifeBuoy" size={20} />
                        SOS / Troubleshoot
                    </button>
                    <button className={`nav-item ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
                        <Icon name="PlayCircle" size={20} />
                        Game Day Setup
                    </button>
                    <button className={`nav-item ${activeTab === 'brand' ? 'active' : ''}`} onClick={() => setActiveTab('brand')}>
                        <Icon name="Palette" size={20} />
                        Brand Identity
                    </button>
                    <button className={`nav-item ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
                        <Icon name="MonitorPlay" size={20} />
                        Media Assets
                    </button>
                    <button className={`nav-item ${activeTab === 'planning' ? 'active' : ''}`} onClick={() => setActiveTab('planning')}>
                        <Icon name="Calendar" size={20} />
                        Stream Planning
                    </button>
                    <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                        <Icon name="BarChart2" size={20} />
                        Analytics
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="btn btn-primary">Join the Rebels Family</button>
                    <div className="form-label" style={{ textAlign: 'center', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                        fremantlerebels@gmail.com.au
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <header className="page-header">
                    <div>
                        <h2 style={{ color: 'var(--rebels-white)' }}>
                            {activeTab === 'vault' && 'Technical Vault & Hardware Info'}
                            {activeTab === 'troubleshoot' && 'Troubleshooting & SOS'}
                            {activeTab === 'setup' && 'Game Day Setup Wizard'}
                            {activeTab === 'brand' && 'Branding & Club Identity'}
                            {activeTab === 'media' && 'Media Asset Hub'}
                            {activeTab === 'planning' && 'Stream Planning'}
                            {activeTab === 'analytics' && 'Post-Game Analytics'}
                        </h2>
                        <p>Command Center for Shirley Strickland Reserve Broadcasts</p>
                    </div>
                    <img src="./assets/rebels logo transparent.png" alt="Rebels Logo" style={{ borderRadius: '50%', width: '80px', height: '80px', objectFit: 'cover', background: 'var(--rebels-white)' }} onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=R"; }} />
                </header>

                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
