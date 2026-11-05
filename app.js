// Game Variables & Scene Setup
let scene, camera, renderer, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isCrouching = false;
let canJump = false;
let velocity = new THREE.Vector3();

// Player Controls & Stats
let playerHeight = 1.62; 
let targetPlayerHeight = 1.62;
let isLocked = false;
let pitch = 0, yaw = 0;

let headYaw = 0;

let myHealth = 100;
let myKills = 0;
let myDeaths = 0;
let matchTimerString = "10:00";
let isDeadLocal = false;
let playerName = "Player";
let gameStarted = false;

// ⚡ Dash Variables
let isDashing = false;
let dashCooldown = false;
const dashSpeed = 35.0;
const dashDuration = 0.15;
let dashTimer = 0;
let dashDirection = new THREE.Vector3();

let bhopBonus = 0;      
let bhopChain = 0;      
let lastLandTime = 0;   
let shiftReleaseTime = 0; 

let isAiming = false;
const normalFOV = 90;
const aimedFOV = 60;

let headBobTimer = 0;
const bobFrequency = 10;
const bobAmplitude = 0.05;
let playerWalkTimer = 0;

let targets = [];
let bloodParticles = [];
let gun, muzzleFlash;
let isShooting = false;
let recoilTimer = 0;
let localPlayerParts = null;

// Multiplayer Setup
const socket = (typeof io !== 'undefined') ? io() : { on: () => {}, emit: () => {}, id: 'local' };
const otherPlayers = {};
let lobbyCharacter = null;
let lobbySteveParts = null;
let lobbyScene = null;
let lobbyCamera = null;
let lobbyPlatform = null;

let lobbyPlayerSize = 0.5;
let lobbyPlayerRotate = 10;
let lobbyShadowScale = 1;

// Lobby gun editor state: x = left(-)/right(+), y = gun centre height,
// scale = gun size. Base pose (x 0, y 0.95, scale 1) is the image pose
// from the previous fix; z stays 0.62 so the gun stays in front of the hands.
let lobbyGunGroup = null;
let lobbyGunX = 0;
let lobbyGunY = 0.95;
let lobbyGunZ = 0.62;
let lobbyGunScale = 1;

// In-game gun editor state (doosre players ki gun, lobby/first-person gun nahi).
// rot degrees me hai, pos character-local units me. Base wahi shift hai jo
// pichli dafa di thi: posX -0.44, posY 1.55, posZ 0.15. PosX character ke
// left/right hai, posZ aage/peeche hai jo side view me screen par
// left/right lagta hai.
let inGameGunGroups = [];
let inGameGunRotX = 0;
let inGameGunRotY = 0;
let inGameGunPosX = -0.44;
let inGameGunPosY = 1.55;
let inGameGunPosZ = 0.15;
let inGamePlayerSize = 1;
let inGamePlayerRotate = 0;
let isInGameGunEditing = false;

// 🌟 Full Advanced Custom Parts & Elbow State
const partNames = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg', 'leftElbow', 'rightElbow', 'leftKnee', 'rightKnee'];
let lobbyCustomParts = {};

partNames.forEach(p => {
    lobbyCustomParts[p] = {
        scale: 1,
        rotX: 0, rotY: 0, rotZ: 0,
        posX: 0, posY: 0, posZ: 0
    };
});

try {
    if (typeof localStorage !== 'undefined') {
        const savedSize = parseFloat(localStorage.getItem('pointerx_lobby_player_size'));
        if (!isNaN(savedSize) && savedSize >= 0.3 && savedSize <= 1) lobbyPlayerSize = savedSize;
        const savedRot = parseFloat(localStorage.getItem('pointerx_lobby_player_rotate'));
        if (!isNaN(savedRot) && savedRot >= -180 && savedRot <= 180) lobbyPlayerRotate = savedRot;
        const savedShadow = parseFloat(localStorage.getItem('pointerx_lobby_shadow_scale'));
        if (!isNaN(savedShadow) && savedShadow >= 0.3 && savedShadow <= 2) lobbyShadowScale = savedShadow;
        const savedGunX = parseFloat(localStorage.getItem('pointerx_lobby_gun_x'));
        if (!isNaN(savedGunX)) lobbyGunX = Math.min(0.6, Math.max(-0.6, savedGunX));
        const savedGunY = parseFloat(localStorage.getItem('pointerx_lobby_gun_y'));
        if (!isNaN(savedGunY)) lobbyGunY = Math.min(1.35, Math.max(0.6, savedGunY));
        const savedLobbyGunZ = parseFloat(localStorage.getItem('pointerx_lobby_gun_z'));
        if (!isNaN(savedLobbyGunZ)) lobbyGunZ = Math.min(1, Math.max(0.3, savedLobbyGunZ));
        const savedGunScale = parseFloat(localStorage.getItem('pointerx_lobby_gun_scale'));
        if (!isNaN(savedGunScale)) lobbyGunScale = Math.min(2, Math.max(0.5, savedGunScale));
        const savedIGRotX = parseFloat(localStorage.getItem('pointerx_ingame_gun_rotX'));
        if (!isNaN(savedIGRotX)) inGameGunRotX = Math.min(60, Math.max(-60, savedIGRotX));
        const savedIGRotY = parseFloat(localStorage.getItem('pointerx_ingame_gun_rotY'));
        if (!isNaN(savedIGRotY)) inGameGunRotY = Math.min(60, Math.max(-60, savedIGRotY));
        const savedIGPosX = parseFloat(localStorage.getItem('pointerx_ingame_gun_posX'));
        if (!isNaN(savedIGPosX)) inGameGunPosX = Math.min(1, Math.max(-1, savedIGPosX));
        const savedIGPosY = parseFloat(localStorage.getItem('pointerx_ingame_gun_posY'));
        if (!isNaN(savedIGPosY)) inGameGunPosY = Math.min(2, Math.max(0.6, savedIGPosY));
        const savedIGPosZ = parseFloat(localStorage.getItem('pointerx_ingame_gun_posZ'));
        if (!isNaN(savedIGPosZ)) inGameGunPosZ = Math.min(1, Math.max(-0.5, savedIGPosZ));
        const savedIGPlayerSize = parseFloat(localStorage.getItem('pointerx_ingame_player_size'));
        if (!isNaN(savedIGPlayerSize)) inGamePlayerSize = Math.min(2, Math.max(0.3, savedIGPlayerSize));
        const savedIGPlayerRotate = parseFloat(localStorage.getItem('pointerx_ingame_player_rotate'));
        if (!isNaN(savedIGPlayerRotate)) inGamePlayerRotate = Math.min(180, Math.max(-180, savedIGPlayerRotate));
        
        partNames.forEach(part => {
            ['scale', 'rotX', 'rotY', 'rotZ', 'posX', 'posY', 'posZ'].forEach(prop => {
                const val = parseFloat(localStorage.getItem(`pointerx_custom_${part}_${prop}`));
                if (!isNaN(val)) lobbyCustomParts[part][prop] = val;
            });
        });
    }
} catch (e) {}

let lastLocalChatText = '';
let lastLocalChatTime = 0;
let lastServerChatKey = '';
let lastServerChatTime = 0;
const shownChatIds = new Set();

let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let mobileJoystick = { active: false, x: 0, y: 0 };
let touchLook = { active: false, startX: 0, startY: 0 };

let authInitialized = false;

const sounds = {
    shoot: new Audio('sounds/shoot.mp3'),
    jump: new Audio('sounds/jump.mp3'),
    dash: new Audio('sounds/jump.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    death: new Audio('sounds/death.mp3')
};

sounds.shoot.volume = 0.5;
sounds.jump.volume = 0.4;
sounds.dash.volume = 0.6;
sounds.hit.volume = 0.6;
sounds.death.volume = 0.7;

function playSound(soundName) {
    if (sounds[soundName]) {
        try {
            const soundClone = sounds[soundName].cloneNode();
            soundClone.volume = sounds[soundName].volume;
            const playPromise = soundClone.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {});
            }
        } catch (e) {}
    }
}

function unlockAudio() {
    Object.keys(sounds).forEach(key => {
        sounds[key].play().then(() => {
            sounds[key].pause();
            sounds[key].currentTime = 0;
        }).catch(() => {});
    });
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
}
window.addEventListener('click', unlockAudio);
window.addEventListener('touchstart', unlockAudio);

init();
animate();

function setupAuthListener() {
    if (authInitialized) return;
    const auth = window.firebaseAuth;
    if (!auth || !window.onAuthStateChanged) return;

    authInitialized = true;

    if (window.getRedirectResult) {
        window.getRedirectResult(auth).then((result) => {
            if (result && result.user) {
                showGoogleNamePrompt(result.user);
            }
        }).catch((err) => {});
    }

    window.onAuthStateChanged(auth, (user) => {
        if (user) {
            const savedCustomName = localStorage.getItem(`pointerx_user_${user.uid}`);
            if (savedCustomName && !gameStarted) {
                startGameWithPlayer(savedCustomName);
            } else if (!gameStarted) {
                showGoogleNamePrompt(user);
            }
        } else {
            const storedGuestName = localStorage.getItem('pointerx_guest_name');
            if (storedGuestName && !gameStarted) {
                startGameWithPlayer(storedGuestName);
            } else if (!gameStarted) {
                initNamePrompt();
            }
        }
    });
}

if (window.firebaseAuth) {
    setupAuthListener();
} else {
    window.addEventListener('firebase-ready', setupAuthListener);
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!authInitialized && !gameStarted) {
                const storedGuestName = localStorage.getItem('pointerx_guest_name');
                if (storedGuestName) {
                    startGameWithPlayer(storedGuestName);
                } else {
                    initNamePrompt();
                }
            }
        }, 1000);
    });
}

window.addEventListener('load', () => {
    setupExitButton();
    setupChatSystem();
});

function setupChatSystem() {
    const chatInput = document.getElementById('chat-input');
    const chatInputWrapper = document.getElementById('chat-input-wrapper');
    const sendBtn = document.getElementById('chat-send-btn');

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            submitChatMessage();
        });
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.code === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                submitChatMessage();
            }
        });
    }
}

function submitChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatInputWrapper = document.getElementById('chat-input-wrapper');
    if (!chatInput) return;

    const text = chatInput.value.trim();
    if (text !== '') {
        const msgId = (socket.id || 'local') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
        shownChatIds.add(msgId);
        appendChatMessage(playerName, text, 'white');
        lastLocalChatText = text;
        lastLocalChatTime = Date.now();
        socket.emit('sendChatMessage', { id: msgId, message: text });
    }
    chatInput.value = '';
    if (chatInputWrapper) chatInputWrapper.style.display = 'none';
    
    if (gameStarted && !isDeadLocal) {
        try { document.body.requestPointerLock(); } catch (e) {}
    }
}

function setupExitButton() {
    const oldBtn = document.getElementById('logout-btn');
    if (oldBtn) {
        const newBtn = oldBtn.cloneNode(true);
        newBtn.textContent = 'EXIT';
        newBtn.addEventListener('click', exitToLobby);
        oldBtn.replaceWith(newBtn);
        return;
    }
    if (document.getElementById('exit-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'exit-btn';
    btn.textContent = 'EXIT';
    btn.style.position = 'absolute';
    btn.style.top = '20px';
    btn.style.right = '20px';
    btn.style.background = '#ff3333';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.padding = '8px 14px';
    btn.style.fontWeight = 'bold';
    btn.style.borderRadius = '5px';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '100';
    btn.style.fontFamily = 'monospace';
    btn.style.display = 'none';
    btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
    btn.addEventListener('click', exitToLobby);
    document.body.appendChild(btn);
}

function exitToLobby() {
    try { document.exitPointerLock(); } catch (e) {}
    gameStarted = false;
    isLocked = false;
    isDeadLocal = false;
    moveForward = false; moveBackward = false; moveLeft = false; moveRight = false;
    isCrouching = false;
    if (velocity) velocity.set(0, 0, 0);
    myHealth = 100; myKills = 0; myDeaths = 0; bhopBonus = 0; bhopChain = 0;
    if (typeof hideRespawnScreen === 'function') hideRespawnScreen();
    Object.keys(otherPlayers).forEach((id) => {
        if (scene) {
            if (otherPlayers[id].mesh) scene.remove(otherPlayers[id].mesh);
            if (otherPlayers[id].nameTag) scene.remove(otherPlayers[id].nameTag);
        }
        delete otherPlayers[id];
    });
    targets = [];
    inGameGunGroups = [];
    if (typeof closeInGameGunEditor === 'function') closeInGameGunEditor();
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) chatMessages.innerHTML = '';
    const blocker = document.getElementById('blocker');
    if (blocker) blocker.style.display = 'none';
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) exitBtn.style.display = 'none';
    if (camera) camera.position.set(0, playerHeight, 0);
    if (socket && typeof socket.disconnect === 'function') {
        try { socket.disconnect(); } catch (e) {}
    }
    const auth = window.firebaseAuth;
    const currentUser = auth ? auth.currentUser : null;
    if (currentUser) {
        showGoogleNamePrompt(currentUser);
    } else {
        initNamePrompt();
    }
    updateHUD();
}

function appendChatMessage(sender, text, color = 'white') {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.style.color = color;
    msgDiv.style.wordBreak = 'break-word';
    
    if (sender) {
        msgDiv.innerHTML = `<span style="font-weight: bold; color: white;">${sender}:</span> ${text}`;
    } else {
        msgDiv.innerHTML = `<span style="font-weight: bold; color: ${color};">${text}</span>`;
    }

    chatMessages.appendChild(msgDiv);

    if (chatMessages.children.length > 8) {
        chatMessages.removeChild(chatMessages.children[0]);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createLobbyCharacter() {
    try {
        if (lobbyCharacter) return;
        if (typeof createSteveCharacter !== 'function') return;
        if (!lobbyScene) {
            lobbyScene = new THREE.Scene();
            lobbyScene.background = new THREE.Color(0x0a1a4a);
            lobbyScene.add(new THREE.AmbientLight(0xffffff, 0.9));
            const dl = new THREE.DirectionalLight(0xffffff, 1.2);
            dl.position.set(2, 4, 3);
            lobbyScene.add(dl);
            const platform = new THREE.Mesh(new THREE.CircleGeometry(0.65, 32), new THREE.MeshBasicMaterial({ color: 0x050a20 }));
            lobbyPlatform = platform;
            platform.scale.set((lobbyPlayerSize / 0.5) * lobbyShadowScale, (lobbyPlayerSize / 0.5) * lobbyShadowScale, 1);
            platform.rotation.x = -Math.PI / 2;
            platform.position.y = 0.01;
            lobbyScene.add(platform);
            lobbyCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
            lobbyCamera.position.set(0, 1.4, 3.4);
            lobbyCamera.lookAt(0, lobbyPlayerSize, 0);
        }
        const steve = createSteveCharacter('lobby');
        lobbySteveParts = steve;
        
        const group = steve.group;
        group.position.set(0, 0, 0);
        group.rotation.set(0, lobbyPlayerRotate * Math.PI / 180, 0);
        group.scale.set(lobbyPlayerSize, lobbyPlayerSize, lobbyPlayerSize);
        
        applyCustomTransformsToParts(lobbySteveParts);

        // Lobby gun, image jaisi pose: seene ke saamne, bilkul horizontal,
        // muzzle viewer ke right side par, aur haathon se aage (z 0.62)
        // taake gun haath ke peeche ghusi hui na lage. Gun group ka origin
        // gun ke centre par hai (y 0.95), taake GUN SIZE slider gun ko usi
        // jagah par bara/chota kare, neeche na khiskaye. Sirf lobby gun
        // badli hai — in-game gun, arms, legs, size/rotate/shadow waisi hi.
        const gunGroup = new THREE.Group();
        gunGroup.position.set(lobbyGunX, lobbyGunY, lobbyGunZ);
        gunGroup.rotation.set(0, Math.PI / 2, 0);
        gunGroup.scale.set(lobbyGunScale, lobbyGunScale, lobbyGunScale);
        lobbyGunGroup = gunGroup;
        const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true }));
        gunBody.position.set(0, 0, 0);
        gunGroup.add(gunBody);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true }));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0, 0.45);
        gunGroup.add(barrel);
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.18), new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true }));
        stock.position.set(0, 0, -0.38);
        gunGroup.add(stock);
        const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.10), new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true }));
        magazine.position.set(0, -0.16, 0.15);
        gunGroup.add(magazine);
        const neonMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
        const stripeTop = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.35), neonMat);
        stripeTop.position.set(0, 0.085, 0);
        gunGroup.add(stripeTop);
        const stripeSide = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.20), neonMat);
        stripeSide.position.set(-0.07, 0, 0.15);
        gunGroup.add(stripeSide);
        group.add(gunGroup);

        steve.leftArmGroup.rotation.set(-0.9, 0, 0.3);
        steve.rightArmGroup.rotation.set(-0.9, 0, -0.3);
        steve.leftLeg.rotation.set(0, 0, -0.08);
        steve.rightLeg.rotation.set(0, 0, 0.08);

        lobbyScene.add(group);
        lobbyCharacter = group;
    } catch (e) {}
}

function removeLobbyCharacter() {
    try {
        if (lobbyCharacter && lobbyScene) lobbyScene.remove(lobbyCharacter);
        if (lobbyCharacter && scene) scene.remove(lobbyCharacter);
        lobbyCharacter = null;
        lobbySteveParts = null;
        lobbyGunGroup = null;
    } catch (e) {}
}

function applyCustomTransformsToParts(steveObj) {
    if (!steveObj) return;
    try {
        const mapping = {
            head: steveObj.head,
            body: steveObj.body,
            leftArm: steveObj.leftArmGroup,
            rightArm: steveObj.rightArmGroup,
            leftLeg: steveObj.leftLeg,
            rightLeg: steveObj.rightLeg,
            leftElbow: steveObj.leftElbowMesh,
            rightElbow: steveObj.rightElbowMesh,
            leftKnee: steveObj.leftKneeMesh,
            rightKnee: steveObj.rightKneeMesh
        };

        partNames.forEach(name => {
            const part = mapping[name];
            const cfg = lobbyCustomParts[name];
            if (part && cfg) {
                if (name !== 'leftElbow' && name !== 'rightElbow' && name !== 'leftKnee' && name !== 'rightKnee') {
                    part.scale.set(cfg.scale, cfg.scale, cfg.scale);
                    part.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
                    if (name === 'head') part.position.set(0, 1.75 + cfg.posY, cfg.posZ);
                    else if (name === 'body') part.position.set(0, 1.125 + cfg.posY, cfg.posZ);
                    else if (name === 'leftArm') part.position.set(-0.44 + cfg.posX, 1.4 + cfg.posY, cfg.posZ);
                    else if (name === 'rightArm') part.position.set(0.44 + cfg.posX, 1.4 + cfg.posY, cfg.posZ);
                    else if (name === 'leftLeg') part.position.set(-0.15 + cfg.posX, 0.75 + cfg.posY, cfg.posZ);
                    else if (name === 'rightLeg') part.position.set(0.15 + cfg.posX, 0.75 + cfg.posY, cfg.posZ);
                } else {
                    // Elbow Bend Rotation
                    part.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
                }
            }
        });
    } catch (e) {}
}

function updatePartProperty(partName, prop, valStr) {
    let v = parseFloat(valStr);
    if (isNaN(v)) return;
    lobbyCustomParts[partName][prop] = v;
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(`pointerx_custom_${partName}_${prop}`, String(v));
        }
    } catch (e) {}
    applyCustomTransformsToParts(lobbySteveParts);
    const valEl = document.getElementById(`val-${partName}-${prop}`);
    if (valEl) valEl.textContent = v.toFixed(2);
}

function setLobbyPlayerSize(size) {
    let v = parseFloat(size);
    if (isNaN(v)) return;
    v = Math.min(1, Math.max(0.3, v));
    lobbyPlayerSize = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_player_size', String(v)); } catch (e) {}
    if (lobbyCharacter) lobbyCharacter.scale.set(v, v, v);
    if (lobbyPlatform) lobbyPlatform.scale.set((v / 0.5) * lobbyShadowScale, (v / 0.5) * lobbyShadowScale, 1);
    const val = document.getElementById('lobby-size-value');
    if (val) val.textContent = v.toFixed(2);
}

function setLobbyPlayerRotate(deg) {
    let v = parseFloat(deg);
    if (isNaN(v)) return;
    v = Math.min(180, Math.max(-180, v));
    lobbyPlayerRotate = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_player_rotate', String(v)); } catch (e) {}
    if (lobbyCharacter) lobbyCharacter.rotation.y = v * Math.PI / 180;
    const val = document.getElementById('lobby-rotate-value');
    if (val) val.textContent = v.toFixed(0) + '°';
    const sl = document.getElementById('lobby-rotate-slider');
    if (sl) sl.value = String(v);
}

function setLobbyShadowScale(vIn) {
    let v = parseFloat(vIn);
    if (isNaN(v)) return;
    v = Math.min(2, Math.max(0.3, v));
    lobbyShadowScale = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_shadow_scale', String(v)); } catch (e) {}
    if (lobbyPlatform) lobbyPlatform.scale.set((lobbyPlayerSize / 0.5) * v, (lobbyPlayerSize / 0.5) * v, 1);
    const val = document.getElementById('lobby-shadow-value');
    if (val) val.textContent = v.toFixed(2);
    const sl = document.getElementById('lobby-shadow-slider');
    if (sl) sl.value = String(v);
}

function applyLobbyGunTransform() {
    if (!lobbyGunGroup) return;
    lobbyGunGroup.position.set(lobbyGunX, lobbyGunY, lobbyGunZ);
    lobbyGunGroup.scale.set(lobbyGunScale, lobbyGunScale, lobbyGunScale);
}

function setLobbyGunX(vIn) {
    let v = parseFloat(vIn);
    if (isNaN(v)) return;
    v = Math.min(0.6, Math.max(-0.6, v));
    lobbyGunX = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_gun_x', String(v)); } catch (e) {}
    applyLobbyGunTransform();
    const val = document.getElementById('lobby-gun-x-value');
    if (val) val.textContent = v.toFixed(2);
    const sl = document.getElementById('lobby-gun-x-slider');
    if (sl) sl.value = String(v);
}

function setLobbyGunY(vIn) {
    let v = parseFloat(vIn);
    if (isNaN(v)) return;
    v = Math.min(1.35, Math.max(0.6, v));
    lobbyGunY = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_gun_y', String(v)); } catch (e) {}
    applyLobbyGunTransform();
    const val = document.getElementById('lobby-gun-y-value');
    if (val) val.textContent = v.toFixed(2);
    const sl = document.getElementById('lobby-gun-y-slider');
    if (sl) sl.value = String(v);
}

function setLobbyGunScale(vIn) {
    let v = parseFloat(vIn);
    if (isNaN(v)) return;
    v = Math.min(2, Math.max(0.5, v));
    lobbyGunScale = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_gun_scale', String(v)); } catch (e) {}
    applyLobbyGunTransform();
    const val = document.getElementById('lobby-gun-size-value');
    if (val) val.textContent = v.toFixed(2);
    const sl = document.getElementById('lobby-gun-size-slider');
    if (sl) sl.value = String(v);
}

function setLobbyGunZ(vIn) {
    let v = parseFloat(vIn);
    if (isNaN(v)) return;
    v = Math.min(1, Math.max(0.3, v));
    lobbyGunZ = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_lobby_gun_z', String(v)); } catch (e) {}
    applyLobbyGunTransform();
    const val = document.getElementById('lobby-gun-z-value');
    if (val) val.textContent = v.toFixed(2);
    const sl = document.getElementById('lobby-gun-z-slider');
    if (sl) sl.value = String(v);
}

function resetLobbyGun() {
    setLobbyGunX(0);
    setLobbyGunY(0.95);
    setLobbyGunZ(0.62);
    setLobbyGunScale(1);
}

// ---- In-game gun editor: doosre player ki gun par click (crosshair) ya G ----
function applyInGameGunTransform() {
    inGameGunGroups.forEach((g) => {
        if (!g) return;
        g.position.set(inGameGunPosX, inGameGunPosY, inGameGunPosZ);
        g.rotation.set(inGameGunRotX * Math.PI / 180, inGameGunRotY * Math.PI / 180, 0);
    });
}

function syncInGameGunEditor() {
    const setVal = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setSlider = (id, v) => { const el = document.getElementById(id); if (el) el.value = String(v); };
    setVal('ig-gun-rotX-value', inGameGunRotX.toFixed(0) + '°'); setSlider('ig-gun-rotX-slider', inGameGunRotX);
    setVal('ig-gun-rotY-value', inGameGunRotY.toFixed(0) + '°'); setSlider('ig-gun-rotY-slider', inGameGunRotY);
    setVal('ig-gun-posX-value', inGameGunPosX.toFixed(2)); setSlider('ig-gun-posX-slider', inGameGunPosX);
    setVal('ig-gun-posY-value', inGameGunPosY.toFixed(2)); setSlider('ig-gun-posY-slider', inGameGunPosY);
    setVal('ig-gun-posZ-value', inGameGunPosZ.toFixed(2)); setSlider('ig-gun-posZ-slider', inGameGunPosZ);
}

function setInGameGunRotX(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(60, Math.max(-60, v)); inGameGunRotX = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_gun_rotX', String(v)); } catch (e) {}
    applyInGameGunTransform(); syncInGameGunEditor();
}

function setInGameGunRotY(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(60, Math.max(-60, v)); inGameGunRotY = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_gun_rotY', String(v)); } catch (e) {}
    applyInGameGunTransform(); syncInGameGunEditor();
}

function setInGameGunPosX(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(1, Math.max(-1, v)); inGameGunPosX = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_gun_posX', String(v)); } catch (e) {}
    applyInGameGunTransform(); syncInGameGunEditor();
}

function setInGameGunPosY(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(2, Math.max(0.6, v)); inGameGunPosY = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_gun_posY', String(v)); } catch (e) {}
    applyInGameGunTransform(); syncInGameGunEditor();
}

function setInGameGunPosZ(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(1, Math.max(-0.5, v)); inGameGunPosZ = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_gun_posZ', String(v)); } catch (e) {}
    applyInGameGunTransform(); syncInGameGunEditor();
}

function resetInGameGun() {
    setInGameGunRotX(0); setInGameGunRotY(0); setInGameGunPosX(-0.44); setInGameGunPosY(1.55); setInGameGunPosZ(0.15);
}

function applyInGamePlayerTransform() {
    Object.values(otherPlayers).forEach((pl) => {
        if (!pl.mesh) return;
        pl.mesh.scale.set(inGamePlayerSize, inGamePlayerSize, inGamePlayerSize);
        pl.mesh.rotation.y = (pl.lastYaw || 0) + Math.PI + inGamePlayerRotate * Math.PI / 180;
    });
}

function syncInGamePlayerEditor() {
    const setVal = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    const setSlider = (id, v) => { const el = document.getElementById(id); if (el) el.value = String(v); };
    setVal('ig-player-size-value', inGamePlayerSize.toFixed(2)); setSlider('ig-player-size-slider', inGamePlayerSize);
    setVal('ig-player-rotate-value', inGamePlayerRotate.toFixed(0) + '°'); setSlider('ig-player-rotate-slider', inGamePlayerRotate);
}

function setInGamePlayerSize(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(2, Math.max(0.3, v)); inGamePlayerSize = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_player_size', String(v)); } catch (e) {}
    applyInGamePlayerTransform(); syncInGamePlayerEditor();
}

function setInGamePlayerRotate(vIn) {
    let v = parseFloat(vIn); if (isNaN(v)) return;
    v = Math.min(180, Math.max(-180, v)); inGamePlayerRotate = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('pointerx_ingame_player_rotate', String(v)); } catch (e) {}
    applyInGamePlayerTransform(); syncInGamePlayerEditor();
}

function resetInGamePlayer() {
    setInGamePlayerSize(1); setInGamePlayerRotate(0);
}

function updateInGamePartProperty(partName, prop, valStr) {
    let v = parseFloat(valStr); if (isNaN(v)) return;
    lobbyCustomParts[partName][prop] = v;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(`pointerx_custom_${partName}_${prop}`, String(v)); } catch (e) {}
    applyCustomTransformsToParts(lobbySteveParts);
    Object.values(otherPlayers).forEach((pl) => { if (pl.parts) applyCustomTransformsToParts(pl.parts); });
    const valEl = document.getElementById(`ig-val-${partName}-${prop}`);
    if (valEl) valEl.textContent = v.toFixed(2);
}

function resetInGameParts() {
    partNames.forEach((partName) => {
        ['scale', 'rotX', 'rotY', 'rotZ', 'posX', 'posY', 'posZ'].forEach((prop) => {
            const def = prop === 'scale' ? 1 : 0;
            lobbyCustomParts[partName][prop] = def;
            try { if (typeof localStorage !== 'undefined') localStorage.setItem(`pointerx_custom_${partName}_${prop}`, String(def)); } catch (e) {}
        });
    });
    applyCustomTransformsToParts(lobbySteveParts);
    Object.values(otherPlayers).forEach((pl) => { if (pl.parts) applyCustomTransformsToParts(pl.parts); });
    syncInGamePartsEditor();
}

function syncInGamePartsEditor() {
    document.querySelectorAll('.ig-custom-part-input').forEach((input) => {
        const partName = input.dataset.part;
        const prop = input.dataset.prop;
        if (lobbyCustomParts[partName] && lobbyCustomParts[partName][prop] !== undefined) {
            input.value = String(lobbyCustomParts[partName][prop]);
            const valEl = document.getElementById(`ig-val-${partName}-${prop}`);
            if (valEl) valEl.textContent = lobbyCustomParts[partName][prop].toFixed(2);
        }
    });
}

function buildInGamePartsHtml() {
    const partLabels = { head: 'HEAD', body: 'BODY', leftArm: 'LEFT ARM', rightArm: 'RIGHT ARM', leftLeg: 'LEFT LEG', rightLeg: 'RIGHT LEG', leftElbow: 'LEFT ELBOW (BEND)', rightElbow: 'RIGHT ELBOW (BEND)', leftKnee: 'LEFT KNEE (BEND)', rightKnee: 'RIGHT KNEE (BEND)' };
    let html = '';
    partNames.forEach((pKey) => {
        const cfg = lobbyCustomParts[pKey];
        const isElbow = pKey === 'leftElbow' || pKey === 'rightElbow' || pKey === 'leftKnee' || pKey === 'rightKnee'; // joint: elbow ya knee, sirf RotX/RotY
        html += '<div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:6px; margin-top:8px;">';
        html += '<div style="font-size:12px; font-weight:bold; color:' + (isElbow ? '#ffaa00' : '#00ffcc') + '; margin-bottom:4px;">' + partLabels[pKey] + '</div>';
        if (!isElbow) {
            html += '<div style="font-size:10px; color:#aaa;">Scale: <span id="ig-val-' + pKey + '-scale">' + cfg.scale.toFixed(2) + '</span></div>';
            html += '<input type="range" class="ig-custom-part-input" data-part="' + pKey + '" data-prop="scale" min="0.3" max="2.0" step="0.05" value="' + cfg.scale + '" style="width:100%; accent-color:#00ffcc;">';
        }
        html += '<div style="display:flex; gap:4px; margin-top:4px;">';
        html += '<div style="flex:1;"><div style="font-size:9px; color:#aaa;">Rot X: <span id="ig-val-' + pKey + '-rotX">' + cfg.rotX.toFixed(2) + '</span></div><input type="range" class="ig-custom-part-input" data-part="' + pKey + '" data-prop="rotX" min="-3.14" max="3.14" step="0.1" value="' + cfg.rotX + '" style="width:100%; accent-color:#ffaa00;"></div>';
        html += '<div style="flex:1;"><div style="font-size:9px; color:#aaa;">Rot Y: <span id="ig-val-' + pKey + '-rotY">' + cfg.rotY.toFixed(2) + '</span></div><input type="range" class="ig-custom-part-input" data-part="' + pKey + '" data-prop="rotY" min="-3.14" max="3.14" step="0.1" value="' + cfg.rotY + '" style="width:100%; accent-color:#ffaa00;"></div>';
        html += '</div>';
        if (!isElbow) {
            html += '<div style="display:flex; gap:4px; margin-top:4px;">';
            html += '<div style="flex:1;"><div style="font-size:9px; color:#aaa;">Rot Z: <span id="ig-val-' + pKey + '-rotZ">' + cfg.rotZ.toFixed(2) + '</span></div><input type="range" class="ig-custom-part-input" data-part="' + pKey + '" data-prop="rotZ" min="-3.14" max="3.14" step="0.1" value="' + cfg.rotZ + '" style="width:100%; accent-color:#ffaa00;"></div>';
            html += '<div style="flex:1;"><div style="font-size:9px; color:#aaa;">Pos Y: <span id="ig-val-' + pKey + '-posY">' + cfg.posY.toFixed(2) + '</span></div><input type="range" class="ig-custom-part-input" data-part="' + pKey + '" data-prop="posY" min="-1.0" max="1.0" step="0.05" value="' + cfg.posY + '" style="width:100%; accent-color:#ff3333;"></div>';
            html += '</div>';
        }
        html += '</div>';
    });
    return html;
}

function closeInGameGunEditor() {
    isInGameGunEditing = false;
    const panel = document.getElementById('ingame-gun-editor');
    if (panel) panel.style.display = 'none';
}

function openInGameGunEditor() {
    // 🔒 Game me editor (G) sirf tab khule jab is naam se login/guest ho.
    // Warna G dabane par kuch nahi hoga, goli normal chalegi.
    if (!isModName(playerName)) return;
    isInGameGunEditing = true;
    let panel = document.getElementById('ingame-gun-editor');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'ingame-gun-editor';
        panel.style.cssText = 'position:fixed;top:70px;right:20px;width:300px;max-width:92vw;max-height:80vh;overflow-y:auto;background:rgba(0,0,0,0.92);border:2px solid #00d2ff;border-radius:12px;padding:14px;z-index:99999;color:white;font-family:monospace;';
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-weight:900;font-size:14px;color:#00d2ff;">IN-GAME PLAYER + GUN EDITOR</div>
                <button id="ig-gun-close" style="background:#222;color:#fff;border:1px solid #444;width:28px;height:28px;border-radius:4px;font-weight:bold;cursor:pointer;">✕</button>
            </div>
            <div style="font-size:11px;color:#aaa;line-height:1.5;margin-bottom:10px;">Doosre players (jo game me dikhte hain) ke liye hai — gun bhi, player size/rotate aur parts bhi, bilkul lobby jaisa. Har change foran dikhega aur refresh ke baad bhi save rahega. YE PANEL SIRF G SE KHULTA HAI — bande par fire karne se ye nahi khulega, fire hamesha goli hi chalegi. Aur ye sirf FPS-3D(123) naam se login hone par khulta hai. Band karne ke baad Click to Start se wapas khelo.</div>
            <hr style="border:0; border-top:1px solid #333; margin:12px 0;">
            <div style="font-size:12px; font-weight:bold; color:#00d2ff; text-align:left; margin-bottom:4px;">PLAYER SIZE / ROTATE (LOBBY JAISA)</div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">PLAYER SIZE: <span id="ig-player-size-value">1.00</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-player-size-minus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">◀ SMALLER</button>
                    <button id="ig-player-size-plus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">BIGGER ▶</button>
                </div>
                <input type="range" id="ig-player-size-slider" min="0.3" max="2" step="0.05" value="1" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">PLAYER ROTATE: <span id="ig-player-rotate-value">0°</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-player-rotate-left" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">◀ LEFT</button>
                    <button id="ig-player-rotate-right" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">RIGHT ▶</button>
                    <button id="ig-player-flip" style="flex:1;padding:6px;font-weight:bold;background:#ffaa00;color:#111;border:none;border-radius:4px;cursor:pointer;font-size:11px;">FLIP</button>
                </div>
                <input type="range" id="ig-player-rotate-slider" min="-180" max="180" step="5" value="0" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <hr style="border:0; border-top:1px solid #333; margin:12px 0;">
            <div style="font-size:12px; font-weight:bold; color:#ffc400; text-align:left; margin-bottom:4px;">ADVANCED PARTS (LOBBY JAISA)</div>
            ${buildInGamePartsHtml()}
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">ROTATE X: <span id="ig-gun-rotX-value">0°</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-gun-rotX-minus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">◀ -5°</button>
                    <button id="ig-gun-rotX-plus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">+5° ▶</button>
                </div>
                <input type="range" id="ig-gun-rotX-slider" min="-60" max="60" step="5" value="0" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">ROTATE Y: <span id="ig-gun-rotY-value">0°</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-gun-rotY-minus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">◀ -5°</button>
                    <button id="ig-gun-rotY-plus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">+5° ▶</button>
                </div>
                <input type="range" id="ig-gun-rotY-slider" min="-60" max="60" step="5" value="0" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">POSITION X: <span id="ig-gun-posX-value">-0.44</span> <span style="color:#aaa;">(- = left, + = right)</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-gun-posX-minus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">◀ LEFT</button>
                    <button id="ig-gun-posX-plus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">RIGHT ▶</button>
                </div>
                <input type="range" id="ig-gun-posX-slider" min="-1" max="1" step="0.05" value="-0.44" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">POSITION Z: <span id="ig-gun-posZ-value">0.15</span> <span style="color:#aaa;">(aage / peeche — side view me left / right)</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-gun-posZ-minus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">◀ BACK</button>
                    <button id="ig-gun-posZ-plus" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">FORWARD ▶</button>
                </div>
                <input type="range" id="ig-gun-posZ-slider" min="-0.5" max="1" step="0.05" value="0.15" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <div style="text-align:left;margin-top:8px;">
                <div style="font-size:11px;color:#00ffcc;">POSITION Y: <span id="ig-gun-posY-value">1.55</span> <span style="color:#aaa;">(up / down)</span></div>
                <div style="display:flex;gap:6px;margin-top:4px;">
                    <button id="ig-gun-posY-up" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">▲ UP</button>
                    <button id="ig-gun-posY-down" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;">▼ DOWN</button>
                </div>
                <input type="range" id="ig-gun-posY-slider" min="0.6" max="2" step="0.05" value="1.55" style="width:100%;accent-color:#00ffcc;cursor:pointer;margin-top:4px;">
            </div>
            <button id="ig-gun-reset" style="width:100%;padding:8px;margin-top:10px;font-weight:bold;background:#334155;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">RESET GUN</button>
            <button id="ig-player-reset" style="width:100%;padding:8px;margin-top:6px;font-weight:bold;background:#334155;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">RESET PLAYER (SIZE + ROTATE)</button>
            <button id="ig-parts-reset" style="width:100%;padding:8px;margin-top:6px;font-weight:bold;background:#334155;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">RESET PARTS</button>
            <button id="ig-gun-done" style="width:100%;padding:10px;margin-top:6px;font-weight:bold;background:#ffc400;color:#111;border:none;border-radius:6px;cursor:pointer;font-size:14px;">DONE</button>
        `;
        document.body.appendChild(panel);
        const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
        const bindSlider = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => fn(el.value)); };
        bind('ig-gun-rotX-minus', () => setInGameGunRotX(inGameGunRotX - 5));
        bind('ig-gun-rotX-plus', () => setInGameGunRotX(inGameGunRotX + 5));
        bind('ig-gun-rotY-minus', () => setInGameGunRotY(inGameGunRotY - 5));
        bind('ig-gun-rotY-plus', () => setInGameGunRotY(inGameGunRotY + 5));
        bind('ig-gun-posX-minus', () => setInGameGunPosX(inGameGunPosX - 0.05));
        bind('ig-gun-posX-plus', () => setInGameGunPosX(inGameGunPosX + 0.05));
        bind('ig-gun-posZ-minus', () => setInGameGunPosZ(inGameGunPosZ - 0.05));
        bind('ig-gun-posZ-plus', () => setInGameGunPosZ(inGameGunPosZ + 0.05));
        bindSlider('ig-gun-posZ-slider', (v) => setInGameGunPosZ(v));
        bind('ig-gun-posY-up', () => setInGameGunPosY(inGameGunPosY + 0.05));
        bind('ig-gun-posY-down', () => setInGameGunPosY(inGameGunPosY - 0.05));
        bindSlider('ig-gun-rotX-slider', (v) => setInGameGunRotX(v));
        bindSlider('ig-gun-rotY-slider', (v) => setInGameGunRotY(v));
        bindSlider('ig-gun-posX-slider', (v) => setInGameGunPosX(v));
        bindSlider('ig-gun-posY-slider', (v) => setInGameGunPosY(v));
        bind('ig-gun-reset', () => resetInGameGun());
        bind('ig-player-reset', () => resetInGamePlayer());
        bind('ig-parts-reset', () => resetInGameParts());
        bind('ig-player-size-minus', () => setInGamePlayerSize(inGamePlayerSize - 0.05));
        bind('ig-player-size-plus', () => setInGamePlayerSize(inGamePlayerSize + 0.05));
        bindSlider('ig-player-size-slider', (v) => setInGamePlayerSize(v));
        bind('ig-player-rotate-left', () => setInGamePlayerRotate(inGamePlayerRotate - 15));
        bind('ig-player-rotate-right', () => setInGamePlayerRotate(inGamePlayerRotate + 15));
        bind('ig-player-flip', () => setInGamePlayerRotate(inGamePlayerRotate === 180 ? 0 : 180));
        bindSlider('ig-player-rotate-slider', (v) => setInGamePlayerRotate(v));
        document.querySelectorAll('.ig-custom-part-input').forEach((input) => {
            input.addEventListener('input', (e) => { updateInGamePartProperty(e.target.dataset.part, e.target.dataset.prop, e.target.value); });
        });
        bind('ig-gun-close', () => closeInGameGunEditor());
        bind('ig-gun-done', () => closeInGameGunEditor());
    }
    syncInGameGunEditor();
    syncInGamePlayerEditor();
    syncInGamePartsEditor();
    panel.style.display = 'block';
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
}

function lobbyToast(msg) {
    const t = document.getElementById('lobby-toast');
    if (t) t.textContent = msg;
}

// 🔒 Modification options sirf is naam ke liye (login ho ya guest login):
// naam bilkul "FPS-3D(123)" hona chahiye, warna options chhupenge.
const MOD_ONLY_NAME = 'FPS-3D(123)';
function isModName(name) { return String(name || '').trim() === MOD_ONLY_NAME; }
function currentLobbyName() {
    const guestInput = document.getElementById('player-name-input');
    if (guestInput) return guestInput.value;
    const googleInput = document.getElementById('google-custom-name');
    if (googleInput) return googleInput.value;
    return (typeof playerName !== 'undefined') ? playerName : '';
}
function applyLobbyModVisibility() {
    const wrap = document.getElementById('lobby-mod-sections');
    if (wrap) wrap.style.display = isModName(currentLobbyName()) ? 'block' : 'none';
}

function buildLobbyHTML(opts) {
    const name = opts.defaultName || 'ANYMAYS';
    const emailLine = opts.email ? `<div style="font-size:12px;color:#aaa;margin-bottom:10px;">Logged in as: ${opts.email}</div>` : '';
    const googleTop = opts.mode === 'guest'
        ? `<button id="google-login-btn" style="width:100%;padding:10px;font-size:14px;font-weight:bold;background:#4285F4;color:white;border:none;border-radius:6px;cursor:pointer;margin-bottom:10px;">Continue with Google</button>`
        : `<button id="prompt-logout-btn" style="width:100%;padding:8px;font-size:12px;background:#ff3333;color:white;border:none;border-radius:6px;cursor:pointer;margin-top:8px;">LOG OUT</button>`;
    const nameInput = opts.mode === 'guest'
        ? `<input type="text" id="player-name-input" placeholder="Enter your name..." value="${name}" style="width:100%;box-sizing:border-box;padding:10px;font-size:14px;text-align:center;background:#111;color:white;border:1px solid #444;border-radius:6px;outline:none;">`
        : `<input type="text" id="google-custom-name" value="${name}" style="width:100%;box-sizing:border-box;padding:10px;font-size:14px;text-align:center;background:#111;color:white;border:1px solid #444;border-radius:6px;outline:none;">`;
    const playBtn = opts.mode === 'guest'
        ? `<button id="join-btn" style="width:100%;padding:14px;font-size:24px;font-weight:900;background:#ffc400;color:#111;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 0 #b88600;margin-top:10px;">PLAY</button>`
        : `<button id="start-google-game" style="width:100%;padding:14px;font-size:24px;font-weight:900;background:#ffc400;color:#111;border:none;border-radius:8px;cursor:pointer;box-shadow:0 4px 0 #b88600;margin-top:10px;">PLAY</button>`;
    
    const menu = ['HUB','STORE','SERVERS','QUESTS','FRIENDS','INVENTORY','EDITOR'].map((m) => {
        const active = m === 'HUB' ? 'background:#2a6cff;color:white;' : 'background:transparent;color:#cdd6ff;';
        return `<button class="lobby-menu-btn" data-menu="${m}" style="width:100%;padding:10px;text-align:left;font-weight:bold;border:none;border-radius:6px;cursor:pointer;${active}">${m}</button>`;
    }).join('');

    const partLabels = { 
        head: 'HEAD', 
        body: 'BODY', 
        leftArm: 'LEFT ARM', 
        rightArm: 'RIGHT ARM', 
        leftLeg: 'LEFT LEG', 
        rightLeg: 'RIGHT LEG',
        leftElbow: 'LEFT ELBOW (BEND)',
        rightElbow: 'RIGHT ELBOW (BEND)',
        leftKnee: 'LEFT KNEE (BEND)',
        rightKnee: 'RIGHT KNEE (BEND)'
    };
    
    let advancedPartsHtml = '';
    partNames.forEach(pKey => {
        const cfg = lobbyCustomParts[pKey];
        const isElbow = pKey === 'leftElbow' || pKey === 'rightElbow' || pKey === 'leftKnee' || pKey === 'rightKnee'; // joint: elbow ya knee, sirf RotX/RotY
        
        advancedPartsHtml += `
            <div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:6px; margin-top:8px;">
                <div style="font-size:12px; font-weight:bold; color:${isElbow ? '#ffaa00' : '#00ffcc'}; margin-bottom:4px;">${partLabels[pKey]}</div>
                
                ${!isElbow ? `
                <div style="font-size:10px; color:#aaa;">Scale: <span id="val-${pKey}-scale">${cfg.scale.toFixed(2)}</span></div>
                <input type="range" class="custom-part-input" data-part="${pKey}" data-prop="scale" min="0.3" max="2.0" step="0.05" value="${cfg.scale}" style="width:100%; accent-color:#00ffcc;">
                ` : ''}

                <div style="display:flex; gap:4px; margin-top:4px;">
                    <div style="flex:1;">
                        <div style="font-size:9px; color:#aaa;">Rot X: <span id="val-${pKey}-rotX">${cfg.rotX.toFixed(2)}</span></div>
                        <input type="range" class="custom-part-input" data-part="${pKey}" data-prop="rotX" min="-3.14" max="3.14" step="0.1" value="${cfg.rotX}" style="width:100%; accent-color:#ffaa00;">
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:9px; color:#aaa;">Rot Y: <span id="val-${pKey}-rotY">${cfg.rotY.toFixed(2)}</span></div>
                        <input type="range" class="custom-part-input" data-part="${pKey}" data-prop="rotY" min="-3.14" max="3.14" step="0.1" value="${cfg.rotY}" style="width:100%; accent-color:#ffaa00;">
                    </div>
                </div>

                ${!isElbow ? `
                <div style="display:flex; gap:4px; margin-top:4px;">
                    <div style="flex:1;">
                        <div style="font-size:9px; color:#aaa;">Rot Z: <span id="val-${pKey}-rotZ">${cfg.rotZ.toFixed(2)}</span></div>
                        <input type="range" class="custom-part-input" data-part="${pKey}" data-prop="rotZ" min="-3.14" max="3.14" step="0.1" value="${cfg.rotZ}" style="width:100%; accent-color:#ffaa00;">
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:9px; color:#aaa;">Pos Y: <span id="val-${pKey}-posY">${cfg.posY.toFixed(2)}</span></div>
                        <input type="range" class="custom-part-input" data-part="${pKey}" data-prop="posY" min="-1.0" max="1.0" step="0.05" value="${cfg.posY}" style="width:100%; accent-color:#ff3333;">
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    });

    return `
    <div style="position:absolute;top:18px;left:50%;transform:translateX(-50%);font-size:42px;font-weight:900;letter-spacing:2px;color:white;text-shadow:3px 3px #000;z-index:2;pointer-events:none;">POINTER <span style="color:#00ffcc;">X</span></div>
    
    <div style="position:absolute;left:0;top:0;bottom:0;width:170px;background:rgba(10,20,70,0.98);padding:16px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;z-index:3;">
        <div style="background:rgba(255,255,255,0.08);padding:12px;border-radius:8px;">
          <div style="font-size:18px;font-weight:bold;word-break:break-word;">${name}</div>
          <div style="font-size:12px;color:#00ffcc;">POINTER X PLAYER</div>
          ${emailLine}
        </div>
        ${menu}
        ${opts.mode === 'google' ? googleTop : ''}
    </div>

    <!-- 🌟 Draggable & Minimizable Anyways Panel -->
    <div id="lobby-card" style="position:absolute; left: calc(50% - 170px); bottom: 20px; background:rgba(0,0,0,0.92); border: 2px solid #222; border-radius:12px; width:340px; max-width:92vw; z-index:10; box-shadow: 0 10px 25px rgba(0,0,0,0.7);">
        
        <div id="lobby-header" style="padding: 12px 16px; background: #111; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; justify-content: space-between; align-items: center; cursor: move; user-select: none;">
            <div style="font-size: 18px; font-weight: 900; color: #fff; letter-spacing: 1px;">ANYMAYS</div>
            <button id="lobby-minimize-btn" style="background: #222; color: #fff; border: 1px solid #444; width: 28px; height: 28px; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;" title="Minimize / Expand">-</button>
        </div>

        <div id="lobby-body" style="padding: 16px; max-height: calc(85vh - 55px); overflow-y: auto; text-align: center;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #00ffcc;">${name}</div>
            ${opts.mode === 'guest' ? googleTop : ''}
            ${nameInput}

            <div id="lobby-mod-sections">
            <hr style="border:0; border-top:1px solid #333; margin:12px 0;">
            <div style="font-size:12px; font-weight:bold; color:#00d2ff; text-align:left; margin-bottom:4px;">GUN EDITOR (LEFT / RIGHT / UP / DOWN / SIZE)</div>
            <div style="text-align:left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">GUN LEFT / RIGHT: <span id="lobby-gun-x-value">${lobbyGunX.toFixed(2)}</span> &nbsp;<span style="color:#aaa;">(- = left, + = right)</span></div>
              <input type="range" id="lobby-gun-x-slider" min="-0.6" max="0.6" step="0.05" value="${lobbyGunX}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
            </div>
            <div style="margin-top:8px; text-align:left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">GUN UP / DOWN: <span id="lobby-gun-y-value">${lobbyGunY.toFixed(2)}</span> &nbsp;<span style="color:#aaa;">(kam = neeche, zyada = upar)</span></div>
              <input type="range" id="lobby-gun-y-slider" min="0.6" max="1.35" step="0.05" value="${lobbyGunY}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
            </div>
            <div style="margin-top:8px; text-align:left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">GUN Z POS: <span id="lobby-gun-z-value">${lobbyGunZ.toFixed(2)}</span> &nbsp;<span style="color:#aaa;">(kam = peeche, zyada = camera ki taraf)</span></div>
              <input type="range" id="lobby-gun-z-slider" min="0.3" max="1" step="0.05" value="${lobbyGunZ}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
            </div>
            <div style="margin-top:8px; text-align:left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">GUN SIZE: <span id="lobby-gun-size-value">${lobbyGunScale.toFixed(2)}</span></div>
              <input type="range" id="lobby-gun-size-slider" min="0.5" max="2" step="0.05" value="${lobbyGunScale}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
            </div>
            <button id="lobby-gun-reset" style="width:100%;padding:8px;margin-top:8px;font-weight:bold;background:#334155;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;">RESET GUN</button>
            
            <div style="margin-top:10px; text-align: left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">PLAYER SIZE: <span id="lobby-size-value">${lobbyPlayerSize.toFixed(2)}</span></div>
              <input type="range" id="lobby-size-slider" min="0.3" max="1" step="0.05" value="${lobbyPlayerSize}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
            </div>

            <div style="margin-top:8px; text-align: left;">
              <div style="font-size:11px;color:#00ffcc; margin-bottom: 2px;">PLAYER ROTATE: <span id="lobby-rotate-value">${lobbyPlayerRotate.toFixed(0)}°</span></div>
              <input type="range" id="lobby-rotate-slider" min="-180" max="180" step="5" value="${lobbyPlayerRotate}" style="width:100%;accent-color:#00ffcc;cursor:pointer;">
              <div style="display:flex;gap:6px;margin-top:6px;">
                <button id="lobby-rotate-left" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">◀ LEFT</button>
                <button id="lobby-rotate-right" style="flex:1;padding:6px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:11px;">RIGHT ▶</button>
                <button id="lobby-flip" style="flex:1;padding:6px;font-weight:bold;background:#ffaa00;color:#111;border:none;border-radius:4px;cursor:pointer;font-size:11px;">FLIP</button>
              </div>
            </div>


            <hr style="border:0; border-top:1px solid #333; margin:12px 0;">
            <div style="font-size:12px; font-weight:bold; color:#ffc400; text-align:left; margin-bottom:4px;">ADVANCED PARTS EDITOR (SCALE / ROT / POS & ELBOWS)</div>
            ${advancedPartsHtml}
            </div>

            <div id="lobby-toast" style="min-height:16px;font-size:12px;color:#00ffcc;margin-top:6px;"></div>
            ${playBtn}
        </div>
    </div>

    <div style="position:absolute;right:0;top:0;bottom:0;width:260px;background:rgba(10,20,70,0.98);padding:16px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;z-index:3;">
        <div style="background:rgba(255,255,255,0.08);padding:12px;border-radius:8px;font-size:13px;line-height:1.6;">
          <b>HOW TO PLAY</b><br>W A S D - Move<br>Space - Jump / Bhop<br>Shift - Crouch, release + Space - Long Jump<br>E - Dash<br>T - Chat<br>Right Click - Zoom Scope
        </div>
        <button class="lobby-side-btn" style="width:100%;padding:12px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:6px;cursor:pointer;">PRIVATE</button>
        <button class="lobby-side-btn" style="width:100%;padding:12px;font-weight:bold;background:#2a6cff;color:white;border:none;border-radius:6px;cursor:pointer;">JOIN</button>
        <button class="lobby-side-btn" style="width:100%;padding:12px;font-weight:bold;background:#334155;color:white;border:none;border-radius:6px;cursor:pointer;">PLAY SETTINGS</button>
    </div>`;
}

function setupLobbyMenus() {
    const card = document.getElementById('lobby-card');
    const header = document.getElementById('lobby-header');
    const minimizeBtn = document.getElementById('lobby-minimize-btn');
    const bodyContent = document.getElementById('lobby-body');

    // 🔒 Mod sections sirf FPS-3D(123) naam par dikhen — naam type karte
    // hi live update, aur lobby khulte hi pehli baar bhi apply ho.
    const _guestNameInput = document.getElementById('player-name-input');
    if (_guestNameInput) _guestNameInput.addEventListener('input', applyLobbyModVisibility);
    const _googleNameInput = document.getElementById('google-custom-name');
    if (_googleNameInput) _googleNameInput.addEventListener('input', applyLobbyModVisibility);
    applyLobbyModVisibility();

    if (card && header) {
        let isDragging = false;
        let startX = 0, startY = 0;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - card.offsetLeft;
            startY = e.clientY - card.offsetTop;
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newX = e.clientX - startX;
            let newY = e.clientY - startY;

            newX = Math.max(0, Math.min(window.innerWidth - card.offsetWidth, newX));
            newY = Math.max(0, Math.min(window.innerHeight - header.offsetHeight, newY));

            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
            card.style.bottom = 'auto';
            card.style.transform = 'none';
        });

        window.addEventListener('mouseup', () => { isDragging = false; });

        header.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX - card.offsetLeft;
            startY = touch.clientY - card.offsetTop;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            let newX = touch.clientX - startX;
            let newY = touch.clientY - startY;
            card.style.left = newX + 'px';
            card.style.top = newY + 'px';
            card.style.bottom = 'auto';
            card.style.transform = 'none';
        }, { passive: true });

        window.addEventListener('touchend', () => { isDragging = false; });
    }

    if (minimizeBtn && bodyContent) {
        let isMinimized = false;
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isMinimized = !isMinimized;
            if (isMinimized) {
                bodyContent.style.display = 'none';
                minimizeBtn.textContent = '+';
            } else {
                bodyContent.style.display = 'block';
                minimizeBtn.textContent = '-';
            }
        });
    }

    document.querySelectorAll('.custom-part-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const partName = e.target.dataset.part;
            const prop = e.target.dataset.prop;
            updatePartProperty(partName, prop, e.target.value);
        });
    });

    const slider = document.getElementById('lobby-size-slider');
    if (slider) {
        slider.value = String(lobbyPlayerSize);
        slider.addEventListener('input', () => { setLobbyPlayerSize(slider.value); });
    }
    const rotSlider = document.getElementById('lobby-rotate-slider');
    if (rotSlider) {
        rotSlider.value = String(lobbyPlayerRotate);
        rotSlider.addEventListener('input', () => { setLobbyPlayerRotate(rotSlider.value); });
    }
    const rotLeft = document.getElementById('lobby-rotate-left');
    if (rotLeft) rotLeft.addEventListener('click', () => { setLobbyPlayerRotate(lobbyPlayerRotate - 15); });
    const rotRight = document.getElementById('lobby-rotate-right');
    if (rotRight) rotRight.addEventListener('click', () => { setLobbyPlayerRotate(lobbyPlayerRotate + 15); });
    const flipBtn = document.getElementById('lobby-flip');
    if (flipBtn) flipBtn.addEventListener('click', () => { setLobbyPlayerRotate(lobbyPlayerRotate === 180 ? 0 : 180); });
    const gunXSlider = document.getElementById('lobby-gun-x-slider');
    if (gunXSlider) {
        gunXSlider.value = String(lobbyGunX);
        gunXSlider.addEventListener('input', () => { setLobbyGunX(gunXSlider.value); });
    }
    const gunYSlider = document.getElementById('lobby-gun-y-slider');
    if (gunYSlider) {
        gunYSlider.value = String(lobbyGunY);
        gunYSlider.addEventListener('input', () => { setLobbyGunY(gunYSlider.value); });
    }
    const gunZSlider = document.getElementById('lobby-gun-z-slider');
    if (gunZSlider) {
        gunZSlider.value = String(lobbyGunZ);
        gunZSlider.addEventListener('input', () => { setLobbyGunZ(gunZSlider.value); });
    }
    const gunSizeSlider = document.getElementById('lobby-gun-size-slider');
    if (gunSizeSlider) {
        gunSizeSlider.value = String(lobbyGunScale);
        gunSizeSlider.addEventListener('input', () => { setLobbyGunScale(gunSizeSlider.value); });
    }
    const gunResetBtn = document.getElementById('lobby-gun-reset');
    if (gunResetBtn) gunResetBtn.addEventListener('click', () => { resetLobbyGun(); });
}

function hideLobbyExtras() {
    ['crosshair','hud','score-dots','match-timer','chat-container'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}
function showGameExtras() {
    ['crosshair','hud','score-dots','match-timer','chat-container'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
}

function showGoogleNamePrompt(user) {
    const oldOverlay = document.getElementById('name-overlay');
    if (oldOverlay) oldOverlay.remove();
    const overlay = document.createElement('div');
    overlay.id = 'name-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '999999';
    overlay.style.fontFamily = 'monospace';
    overlay.style.color = 'white';
    const defaultName = localStorage.getItem(`pointerx_user_${user.uid}`) || user.displayName || "GoogleUser";
    overlay.innerHTML = buildLobbyHTML({ mode: 'google', defaultName, email: user.email });
    document.body.appendChild(overlay);
    hideLobbyExtras();
    try { createLobbyCharacter(); } catch (e) {}
    setupLobbyMenus();
    const startBtn = document.getElementById('start-google-game');
    if (startBtn) startBtn.addEventListener('click', () => {
        const input = document.getElementById('google-custom-name');
        let finalName = input ? input.value.trim() : "GoogleUser";
        if (finalName === "") finalName = "GoogleUser";
        localStorage.setItem(`pointerx_user_${user.uid}`, finalName);
        startGameWithPlayer(finalName);
    });
    const logoutBtn = document.getElementById('prompt-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        if (window.firebaseAuth && window.signOut) {
            window.signOut(window.firebaseAuth).then(() => { location.reload(); });
        }
    });
}

function initNamePrompt() {
    const oldOverlay = document.getElementById('name-overlay');
    if (oldOverlay) oldOverlay.remove();
    const overlay = document.createElement('div');
    overlay.id = 'name-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '999999';
    overlay.style.fontFamily = 'monospace';
    overlay.style.color = 'white';
    const defaultGuestName = localStorage.getItem('pointerx_guest_name') || `Player_${Math.floor(Math.random()*1000)}`;
    overlay.innerHTML = buildLobbyHTML({ mode: 'guest', defaultName: defaultGuestName });
    document.body.appendChild(overlay);
    hideLobbyExtras();
    try { createLobbyCharacter(); } catch (e) {}
    setupLobbyMenus();
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            const auth = window.firebaseAuth;
            const provider = window.googleProvider;
            if (auth && provider) {
                if (window.signInWithPopup) {
                    window.signInWithPopup(auth, provider)
                        .then((result) => { showGoogleNamePrompt(result.user); })
                        .catch((error) => {
                            if (error.code === 'auth/popup-blocked' && window.signInWithRedirect) {
                                window.signInWithRedirect(auth, provider);
                            } else {
                                alert("Google Login Failed: " + (error.message || "Try again."));
                            }
                        });
                } else if (window.signInWithRedirect) {
                    window.signInWithRedirect(auth, provider);
                }
            } else {
                alert("Firebase Auth is still initializing. Please wait a second!");
            }
        });
    }
    const joinBtn = document.getElementById('join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const input = document.getElementById('player-name-input');
            let pName = input ? input.value.trim() : "Player";
            if (pName === "") pName = "Player";
            localStorage.setItem('pointerx_guest_name', pName);
            startGameWithPlayer(pName);
        });
    }
}

function startGameWithPlayer(name) {
    playerName = name;
    try { removeLobbyCharacter(); } catch (e) {}
    if (gun) gun.visible = true;
    try { showGameExtras(); } catch (e) {}
    const overlay = document.getElementById('name-overlay');
    if (overlay) overlay.remove();

    setupExitButton();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'block';
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) exitBtn.style.display = 'block';

    if (socket && typeof socket.connect === 'function' && socket.disconnected) {
        try { socket.connect(); } catch (e) {}
    }

    gameStarted = true;
    socket.emit('setPlayerName', playerName);
    updateHUD();

    if (isMobile) {
        setupMobileControls();
        isLocked = true;
    } else {
        const blocker = document.getElementById('blocker');
        if (blocker) { blocker.style.display = 'none'; }
        document.body.requestPointerLock();
    }
}

function triggerHitMarker(isHeadshot = false) {
    let crosshair = document.getElementById('crosshair');
    if (!crosshair) return;

    crosshair.style.backgroundColor = '#ff0000';
    crosshair.style.transform = 'translate(-50%, -50%) rotate(45deg) scale(1.6)';
    crosshair.style.boxShadow = isHeadshot ? '0 0 10px #ff0000, 0 0 20px #ff0000' : '0 0 8px #ff3300';

    setTimeout(() => {
        crosshair.style.backgroundColor = '#00ff00';
        crosshair.style.transform = 'translate(-50%, -50%) rotate(0deg) scale(1)';
        crosshair.style.boxShadow = 'none';
    }, 100);

    const popup = document.createElement('div');
    popup.innerText = isHeadshot ? "🎯 HEADSHOT!" : "💥 HIT";
    popup.style.position = 'fixed';
    popup.style.top = '46%';
    popup.style.left = '52%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.color = isHeadshot ? '#ff0000' : '#ffcc00';
    popup.style.fontSize = isHeadshot ? '20px' : '14px';
    popup.style.fontWeight = 'bold';
    popup.style.fontFamily = 'monospace';
    popup.style.pointerEvents = 'none';
    popup.style.zIndex = '999';
    popup.style.textShadow = '1px 1px 2px #000';
    document.body.appendChild(popup);

    setTimeout(() => { popup.remove(); }, 350);
}

function init() {
    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('night-sky.png', 
        (texture) => {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            scene.background = texture;
        }, 
        undefined, 
        () => {}
    );

    scene.fog = new THREE.Fog(0x0a0a1a, 50, 250);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, playerHeight, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);

    createMap();
    createGun();

    if (!isMobile) { setupPointerLock(); }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    window.addEventListener('mousedown', (e) => {
        if (!isLocked || isDeadLocal || !gameStarted) return;
        if (e.button === 0) { shoot(e); } 
        else if (e.button === 2) { 
            isAiming = true; 
            camera.fov = aimedFOV;
            camera.updateProjectionMatrix();
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (e.button === 2) { 
            isAiming = false; 
            camera.fov = normalFOV;
            camera.updateProjectionMatrix();
        }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    socket.on('currentPlayers', (serverPlayers) => {
        Object.keys(serverPlayers).forEach((id) => {
            if (id === socket.id) return;
            createOtherPlayerMesh(id, serverPlayers[id]);
        });
    });

    socket.on('newPlayer', (data) => {
        createOtherPlayerMesh(data.id, data.player);
    });

    socket.on('chatMessage', (data) => {
        if (data.id) {
            if (shownChatIds.has(data.id)) return;
            shownChatIds.add(data.id);
            if (shownChatIds.size > 200) shownChatIds.clear();
        }
        const _now = Date.now();
        if (data.name === playerName && data.message === lastLocalChatText && _now - lastLocalChatTime < 5000) return;
        const _key = data.name + '\0' + data.message;
        if (_key === lastServerChatKey && _now - lastServerChatTime < 2000) return;
        lastServerChatKey = _key;
        lastServerChatTime = _now;
        appendChatMessage(data.name, data.message, 'white');
    });

    socket.on('playerJoinedNotif', (name) => {
        appendChatMessage('', `${name} Joined the game`, '#00ff00');
    });

    socket.on('playerLeftNotif', (name) => {
        appendChatMessage('', `${name} Left the game`, '#ff3333');
    });

    socket.on('gameNotification', (msg) => { showGameNotification(msg); });

    socket.on('timerUpdate', (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        matchTimerString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        updateHUD();
    });

    socket.on('playerStatsUpdate', (data) => {
        if (data.targetId === socket.id) { myDeaths = data.targetDeaths; }
        if (data.attackerId === socket.id) { myKills = data.attackerKills; }
        updateHUD();
    });

    socket.on('playerMoved', (data) => {
        if (otherPlayers[data.id]) {
            const p = otherPlayers[data.id];
            if (p.isDead) return;
            
            const targetY = data.player.isCrouching ? (data.player.y - 2.1) : (data.player.y - 1.62);
            p.mesh.position.set(data.player.x, targetY, data.player.z);
            p.lastYaw = data.player.yaw;
            p.mesh.rotation.y = data.player.yaw + Math.PI + inGamePlayerRotate * Math.PI / 180;
            p.isMoving = !!data.player.isMoving;
            p.isCrouching = !!data.player.isCrouching;

            if (p.nameTag) {
                p.nameTag.position.set(data.player.x, targetY + 2.4, data.player.z);
            }

            if (data.player.isDashing) {
                spawnGhostShade(data.player.x, targetY, data.player.z, data.player.yaw);
            }
        }
    });

    socket.on('spawnBlood', (pos) => { spawnBloodSplatter(pos); });

    socket.on('playerDied', (data) => {
        if (data.id === socket.id) {
            isDeadLocal = true;
            myHealth = 0;
            camera.position.y = 0.4;
            playSound('death');
            showRespawnScreen(3);
        }
        if (otherPlayers[data.id]) {
            const p = otherPlayers[data.id];
            p.isDead = true;
        }
    });

    socket.on('playerRespawned', (data) => {
        if (data.id === socket.id) {
            isDeadLocal = false;
            myHealth = 100;
            bhopBonus = 0;
            bhopChain = 0;
            hideRespawnScreen();
            camera.position.set(data.player.x, playerHeight, data.player.z);
        }
        if (otherPlayers[data.id]) {
            const p = otherPlayers[data.id];
            p.isDead = false;
            p.lastYaw = (data.player.yaw || 0);
            p.mesh.rotation.set(0, (data.player.yaw || 0) + Math.PI + inGamePlayerRotate * Math.PI / 180, 0);
            p.mesh.scale.set(inGamePlayerSize, inGamePlayerSize, inGamePlayerSize);
            p.mesh.position.set(data.player.x, data.player.y - 1.62, data.player.z);
            if (p.lastPos) p.lastPos.copy(p.mesh.position); else p.lastPos = p.mesh.position.clone();
            p.walkPhase = 0; p.walkAmount = 0;
            
            p.mesh.traverse((child) => {
                if (child.userData && child.userData.isGunHitBox) return;
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.opacity = 1.0);
                    } else {
                        child.material.opacity = 1.0;
                    }
                }
            });
            if (p.nameTag && p.nameTag.material) {
                p.nameTag.material.opacity = 1.0;
                p.nameTag.visible = true;
            }
        }
    });

    socket.on('playerHealthUpdate', (data) => {
        if (data.id === socket.id) {
            myHealth = data.health;
            updateHUD();
        }
    });

    socket.on('playerDisconnect', (id) => {
        if (otherPlayers[id]) {
            if (otherPlayers[id].gunGroup) inGameGunGroups = inGameGunGroups.filter((g) => g !== otherPlayers[id].gunGroup);
            const mesh = otherPlayers[id].mesh;
            scene.remove(mesh);
            if (otherPlayers[id].nameTag) { scene.remove(otherPlayers[id].nameTag); }
            const meshParts = [];
            mesh.traverse(child => { if (child.isMesh) meshParts.push(child); });
            targets = targets.filter(t => !meshParts.includes(t));
            delete otherPlayers[id];
        }
    });
}

function updateHUD() {
    let hud = document.getElementById('hud');
    const kdRatio = myDeaths === 0 ? myKills.toFixed(2) : (myKills / myDeaths).toFixed(2);

    if (hud) {
        hud.innerHTML = `PLAYER: ${playerName}<br>` +
                        `HEALTH: ${myHealth} | AMMO: 30 / 30`;
    }

    let dots = document.getElementById('score-dots');
    if (!dots) {
        dots = document.createElement('div');
        dots.id = 'score-dots';
        dots.style.position = 'absolute';
        dots.style.top = '20px';
        dots.style.left = '20px';
        dots.style.display = 'flex';
        dots.style.flexDirection = 'column';
        dots.style.gap = '4px';
        dots.style.fontFamily = 'monospace';
        dots.style.fontSize = '16px';
        dots.style.fontWeight = 'bold';
        dots.style.textShadow = '2px 2px black';
        dots.style.zIndex = '100';
        dots.style.pointerEvents = 'none';
        document.body.appendChild(dots);
    }
    
    let timerEl = document.getElementById('match-timer');
    if (!timerEl) {
        timerEl = document.createElement('div');
        timerEl.id = 'match-timer';
        timerEl.style.position = 'absolute';
        timerEl.style.top = '20px';
        timerEl.style.left = '50%';
        timerEl.style.transform = 'translateX(-50%)';
        timerEl.style.background = '#000';
        timerEl.style.color = '#fff';
        timerEl.style.padding = '8px 28px';
        timerEl.style.fontFamily = 'monospace';
        timerEl.style.fontSize = '28px';
        timerEl.style.fontWeight = 'bold';
        timerEl.style.zIndex = '100';
        timerEl.style.pointerEvents = 'none';
        document.body.appendChild(timerEl);
    }
    timerEl.textContent = matchTimerString;

    const dotStyle = 'display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; vertical-align: middle;';
    dots.innerHTML =
        `<div style="color: #ff3333;"><span style="${dotStyle} background: #ff3333;"></span>${myDeaths}</div>` +
        `<div style="color: #00ff00;"><span style="${dotStyle} background: #00ff00;"></span>${myKills}</div>` +
        `<div style="color: #ffcc00;"><span style="${dotStyle} background: #ffcc00;"></span>${kdRatio}</div>`;
}

function showGameNotification(message) {
    let notif = document.getElementById('game-notif');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'game-notif';
        notif.style.position = 'absolute';
        notif.style.top = '80px';
        notif.style.left = '50%';
        notif.style.transform = 'translateX(-50%)';
        notif.style.background = 'rgba(0, 0, 0, 0.6)';
        notif.style.color = '#00ffcc';
        notif.style.padding = '8px 16px';
        notif.style.borderRadius = '5px';
        notif.style.fontFamily = 'monospace';
        notif.style.fontSize = '14px';
        notif.style.fontWeight = 'bold';
        notif.style.zIndex = '100';
        document.body.appendChild(notif);
    }
    notif.innerText = message;
    notif.style.opacity = '1';
    setTimeout(() => { notif.style.opacity = '0'; }, 3500);
}

function createNameTag(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(spriteMaterial);
}

function showRespawnScreen(secondsLeft) {
    let respawnDiv = document.getElementById('respawn-screen');
    if (!respawnDiv) {
        respawnDiv = document.createElement('div');
        respawnDiv.id = 'respawn-screen';
        respawnDiv.style.position = 'absolute';
        respawnDiv.style.top = '50%';
        respawnDiv.style.left = '50%';
        respawnDiv.style.transform = 'translate(-50%, -50%)';
        respawnDiv.style.color = 'red';
        respawnDiv.style.fontFamily = 'monospace';
        respawnDiv.style.fontSize = '36px';
        respawnDiv.style.fontWeight = 'bold';
        respawnDiv.style.textShadow = '2px 2px black';
        respawnDiv.style.zIndex = '1000';
        respawnDiv.style.transition = 'opacity 0.5s ease';
        respawnDiv.style.opacity = '1';
        document.body.appendChild(respawnDiv);
    }

    if (secondsLeft <= 0) {
        hideRespawnScreen();
        return;
    }

    respawnDiv.innerText = `YOU DIED! Respawning in ${secondsLeft}s...`;
    setTimeout(() => { showRespawnScreen(secondsLeft - 1); }, 1000);
}

function hideRespawnScreen() {
    const respawnDiv = document.getElementById('respawn-screen');
    if (respawnDiv) {
        respawnDiv.style.opacity = '0';
        setTimeout(() => { respawnDiv.remove(); }, 500);
    }
    updateHUD();
}

function spawnBloodSplatter(pos) {
    if (!pos) return;
    const particleCount = 14;
    const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(geometry, material);
        particle.position.set(pos.x, pos.y, pos.z);
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 5, 
            Math.random() * 4 + 1.5, 
            (Math.random() - 0.5) * 5
        );
        scene.add(particle);
        bloodParticles.push({ mesh: particle, velocity: vel, life: 0.5 });
    }
}

function spawnGhostShade(x, y, z, rotY) {
    const ghostGroup = new THREE.Group();
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.3), ghostMat);
    body.position.y = 1.125;
    ghostGroup.add(body);
    ghostGroup.position.set(x, y, z);
    ghostGroup.rotation.y = rotY;
    scene.add(ghostGroup);

    let fadeLife = 0.3;
    const fadeInterval = setInterval(() => {
        fadeLife -= 0.05;
        ghostMat.opacity = fadeLife;
        if (fadeLife <= 0) {
            clearInterval(fadeInterval);
            scene.remove(ghostGroup);
        }
    }, 30);
}

function createMap() {
    const arenaSize = 500;
    const floorGeo = new THREE.PlaneGeometry(arenaSize, arenaSize);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('ground-texture.png', (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
    });

    const floorMat = new THREE.MeshStandardMaterial({ map: groundTexture, color: 0x555555 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const wallHeight = 10;
    const wallThickness = 2;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });

    const wallN = new THREE.Mesh(new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness), wallMat);
    wallN.position.set(0, wallHeight / 2, -arenaSize / 2);
    scene.add(wallN);
    const wallS = new THREE.Mesh(new THREE.BoxGeometry(arenaSize, wallHeight, wallThickness), wallMat);
    wallS.position.set(0, wallHeight / 2, arenaSize / 2);
    scene.add(wallS);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize), wallMat);
    wallE.position.set(arenaSize / 2, wallHeight / 2, 0);
    scene.add(wallE);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, arenaSize), wallMat);
    wallW.position.set(-arenaSize / 2, wallHeight / 2, 0);
    scene.add(wallW);

    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    for (let i = 0; i < 40; i++) {
        const crate = new THREE.Mesh(boxGeo, boxMat);
        crate.position.set((Math.random() - 0.5) * (arenaSize - 40), 1, (Math.random() - 0.5) * (arenaSize - 40));
        scene.add(crate);
    }
}

function createGun() {
    const gunGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.3 }));
    body.position.set(0.25, -0.25, -0.5);
    gunGroup.add(body);

    const topPart = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.5), new THREE.MeshStandardMaterial({ color: 0x2e2e2e }));
    topPart.position.set(0.25, -0.13, -0.5);
    gunGroup.add(topPart);

    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.3), neonMat);
    stripe1.position.set(0.25, -0.09, -0.5);
    gunGroup.add(stripe1);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.25, -0.22, -0.95);
    gunGroup.add(barrel);

    muzzleFlash = new THREE.Mesh(new THREE.SphereGeometry(0.06), neonMat);
    muzzleFlash.position.set(0.25, -0.22, -1.15);
    muzzleFlash.visible = false;
    gunGroup.add(muzzleFlash);

    gun = gunGroup;
    camera.add(gun);
    scene.add(camera);
}

function createSteveHeadMaterials() {
    const hairColor = '#3b2416';
    const skinColor = '#c68642';
    const eyeWhite = '#ffffff';
    const eyeBlue = '#3b3b9b';
    const mouthColor = '#4a2511';

    function makeFaceCanvas(drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = hairColor;
        ctx.fillRect(0, 0, 64, 64);
        drawFn(ctx);
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    }

    const matRight = makeFaceCanvas((ctx) => {
        ctx.fillStyle = skinColor; ctx.fillRect(0, 24, 64, 40);
        ctx.fillStyle = hairColor; ctx.fillRect(0, 0, 64, 24);
    });
    const matLeft = makeFaceCanvas((ctx) => {
        ctx.fillStyle = skinColor; ctx.fillRect(0, 24, 64, 40);
        ctx.fillStyle = hairColor; ctx.fillRect(0, 0, 64, 24);
    });
    const matTop = makeFaceCanvas((ctx) => { ctx.fillStyle = hairColor; ctx.fillRect(0, 0, 64, 64); });
    const matBottom = makeFaceCanvas((ctx) => { ctx.fillStyle = '#ad6f32'; ctx.fillRect(0, 0, 64, 64); });
    const matFront = makeFaceCanvas((ctx) => {
        ctx.fillStyle = skinColor; ctx.fillRect(0, 24, 64, 40);
        ctx.fillStyle = hairColor; ctx.fillRect(0, 0, 64, 24);
        ctx.fillStyle = eyeWhite; ctx.fillRect(8, 32, 16, 8); ctx.fillRect(40, 32, 16, 8);
        ctx.fillStyle = eyeBlue; ctx.fillRect(16, 32, 8, 8); ctx.fillRect(40, 32, 8, 8);
        ctx.fillStyle = mouthColor; ctx.fillRect(24, 44, 16, 12);
    });
    const matBack = makeFaceCanvas((ctx) => {
        ctx.fillStyle = hairColor; ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = skinColor; ctx.fillRect(16, 48, 32, 16);
    });

    return [matRight, matLeft, matTop, matBottom, matFront, matBack];
}

function createSteveCharacter(playerId, applyCustoms = true) {
    const steveGroup = new THREE.Group();
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x00a8b5, transparent: true });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x3b449b, transparent: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68642, transparent: true });

    // 🌟 Legs with Knee Joints, bilkul elbow wali structure:
    // hip group (y 0.75) -> thigh (0.375) -> knee group (thigh ke neeche)
    // -> shin (0.375, knee se neeche wala hissa). Total height pehle
    // jaisi 0.75 hi hai, pair zameen par hi rehte hain.
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.15, 0.75, 0);
    const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.375, 0.3), pantsMat);
    leftThigh.position.set(0, -0.187, 0);
    leftThigh.userData = { id: playerId, bodyPart: 'leg' };
    leftLeg.add(leftThigh);
    const leftKneeMesh = new THREE.Group();
    leftKneeMesh.position.set(0, -0.375, 0);
    const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.375, 0.28), pantsMat);
    leftShin.position.set(0, -0.187, 0);
    leftShin.userData = { id: playerId, bodyPart: 'leg' };
    leftKneeMesh.add(leftShin);
    leftLeg.add(leftKneeMesh);
    steveGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.15, 0.75, 0);
    const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.375, 0.3), pantsMat);
    rightThigh.position.set(0, -0.187, 0);
    rightThigh.userData = { id: playerId, bodyPart: 'leg' };
    rightLeg.add(rightThigh);
    const rightKneeMesh = new THREE.Group();
    rightKneeMesh.position.set(0, -0.375, 0);
    const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.375, 0.28), pantsMat);
    rightShin.position.set(0, -0.187, 0);
    rightShin.userData = { id: playerId, bodyPart: 'leg' };
    rightKneeMesh.add(rightShin);
    rightLeg.add(rightKneeMesh);
    steveGroup.add(rightLeg);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.3), shirtMat);
    body.position.y = 1.125;
    body.userData = { id: playerId, bodyPart: 'body' };
    steveGroup.add(body);

    // 🌟 Arms with Elbow Sub-groups/Meshes
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.44, 1.4, 0);
    const leftArmUpper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.375, 0.28), skinMat);
    leftArmUpper.position.set(0, -0.187, 0);
    leftArmGroup.add(leftArmUpper);
    
    const leftElbowMesh = new THREE.Group();
    leftElbowMesh.position.set(0, -0.375, 0);
    const leftArmLower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.375, 0.26), skinMat);
    leftArmLower.position.set(0, -0.187, 0);
    leftArmLower.userData = { id: playerId, bodyPart: 'hand' };
    leftElbowMesh.add(leftArmLower);
    leftArmGroup.add(leftElbowMesh);
    steveGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.44, 1.4, 0);
    const rightArmUpper = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.375, 0.28), skinMat);
    rightArmUpper.position.set(0, -0.187, 0);
    rightArmGroup.add(rightArmUpper);

    const rightElbowMesh = new THREE.Group();
    rightElbowMesh.position.set(0, -0.375, 0);
    const rightArmLower = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.375, 0.26), skinMat);
    rightArmLower.position.set(0, -0.187, 0);
    rightArmLower.userData = { id: playerId, bodyPart: 'hand' };
    rightElbowMesh.add(rightArmLower);
    rightArmGroup.add(rightElbowMesh);
    steveGroup.add(rightArmGroup);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), createSteveHeadMaterials());
    head.position.y = 1.75;
    head.userData = { id: playerId, bodyPart: 'head' };
    steveGroup.add(head);

    if (applyCustoms && typeof lobbyCustomParts !== 'undefined') {
        const mapping = { head, body, leftArm: leftArmGroup, rightArm: rightArmGroup, leftLeg, rightLeg, leftElbow: leftElbowMesh, rightElbow: rightElbowMesh, leftKnee: leftKneeMesh, rightKnee: rightKneeMesh };
        partNames.forEach(name => {
            const part = mapping[name];
            const cfg = lobbyCustomParts[name];
            if (part && cfg) {
                if (name !== 'leftElbow' && name !== 'rightElbow' && name !== 'leftKnee' && name !== 'rightKnee') {
                    part.scale.set(cfg.scale, cfg.scale, cfg.scale);
                    part.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
                    if (name === 'head') part.position.set(0, 1.75 + cfg.posY, cfg.posZ);
                    else if (name === 'body') part.position.set(0, 1.125 + cfg.posY, cfg.posZ);
                    else if (name === 'leftArm') part.position.set(-0.44 + cfg.posX, 1.4 + cfg.posY, cfg.posZ);
                    else if (name === 'rightArm') part.position.set(0.44 + cfg.posX, 1.4 + cfg.posY, cfg.posZ);
                    else if (name === 'leftLeg') part.position.set(-0.15 + cfg.posX, 0.75 + cfg.posY, cfg.posZ);
                    else if (name === 'rightLeg') part.position.set(0.15 + cfg.posX, 0.75 + cfg.posY, cfg.posZ);
                } else {
                    part.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);
                }
            }
        });
    }

    return { group: steveGroup, leftLeg, rightLeg, leftArmGroup, rightArmGroup, leftElbowMesh, rightElbowMesh, leftKneeMesh, rightKneeMesh, body, head };
}

function createOtherPlayerMesh(id, playerData) {
    if (otherPlayers[id]) return;

    const steveChar = createSteveCharacter(id, true);
    const playerMesh = steveChar.group;

    const playerGunGroup = new THREE.Group();
    // Game ke ander doosre player ki gun: saved in-game editor pose lagti hai
    // (default: pichla shift -0.44, 1.55, 0.15). Lobby/first-person gun alag hain.
    playerGunGroup.position.set(inGameGunPosX, inGameGunPosY, inGameGunPosZ);
    playerGunGroup.rotation.set(inGameGunRotX * Math.PI / 180, inGameGunRotY * Math.PI / 180, 0);
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0x222222, transparent: true }));
    gunBody.position.set(0, -0.3, 0.3);
    playerGunGroup.add(gunBody);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3), new THREE.MeshStandardMaterial({ color: 0x111111, transparent: true }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, -0.3, 0.6);
    playerGunGroup.add(barrel);

    // Registry sirf is liye hai taake panel se gun ki live position/
    // rotation badli ja sake. Click se editor khulna band hai, isliye
    // koi click/hit box nahi hai — fire hamesha goli hi chalegi.
    inGameGunGroups.push(playerGunGroup);

    playerMesh.add(playerGunGroup);
    playerMesh.rotation.y = (playerData.yaw || 0) + Math.PI + inGamePlayerRotate * Math.PI / 180;
    playerMesh.scale.set(inGamePlayerSize, inGamePlayerSize, inGamePlayerSize);
    playerMesh.position.set(playerData.x, playerData.y - 1.62, playerData.z);
    scene.add(playerMesh);

    const nameTag = createNameTag(playerData.name || "Player");
    nameTag.position.set(playerData.x, playerData.y + 0.8, playerData.z);
    scene.add(nameTag);

    playerMesh.traverse((child) => {
        if (child.isMesh && child.userData && child.userData.bodyPart) { targets.push(child); }
    });

    otherPlayers[id] = { mesh: playerMesh, nameTag: nameTag, isDead: false, gunGroup: playerGunGroup, parts: steveChar, lastYaw: (playerData.yaw || 0), lastPos: null, walkPhase: 0, walkAmount: 0, isMoving: false, isCrouching: false };
}

function setupPointerLock() {
    const blocker = document.getElementById('blocker');
    renderer.domElement.addEventListener('click', () => {
        if (gameStarted && !isLocked && !isDeadLocal) { document.body.requestPointerLock(); }
    });
    if (blocker) {
        blocker.addEventListener('click', () => {
            if (gameStarted && !isDeadLocal) { document.body.requestPointerLock(); }
        });
    }
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) {
            isLocked = true;
            if (typeof closeInGameGunEditor === 'function') closeInGameGunEditor();
            if (blocker) blocker.style.display = 'none';
        } else {
            isLocked = false;
            if (gameStarted && !isDeadLocal && blocker) { blocker.style.display = 'flex'; }
        }
    });
    document.addEventListener('mousemove', (e) => {
        if (!isLocked || !gameStarted) return;
        const mouseSensitivity = 0.002;
        pitch -= e.movementY * mouseSensitivity;
        pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
        headYaw -= e.movementX * mouseSensitivity;
    });
}

function setupMobileControls() {
    if (!isMobile) return;
    const oldUI = document.getElementById('mobile-controls-ui');
    if (oldUI) oldUI.remove();
    const ui = document.createElement('div');
    ui.id = 'mobile-controls-ui';
    ui.style.position = 'fixed';
    ui.style.top = '0'; ui.style.left = '0'; ui.style.width = '100vw'; ui.style.height = '100vh';
    ui.style.pointerEvents = 'none'; ui.style.zIndex = '99999';
    ui.innerHTML = `
        <div id="joystick-zone" style="position: absolute; bottom: 20px; left: 20px; width: 140px; height: 140px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; pointer-events: auto; touch-action: none;">
            <div id="joystick-thumb" style="position: absolute; top: 45px; left: 45px; width: 50px; height: 50px; background: rgba(0,255,204,0.7); border-radius: 50%; pointer-events: none;"></div>
        </div>
    `;
    document.body.appendChild(ui);
}

function performJump() {
    if (!canJump || isCrouching || isDeadLocal || !gameStarted) return false;
    velocity.y = 8.5;
    canJump = false;
    playSound('jump');
    return true;
}

function onKeyDown(e) {
    if (!gameStarted) return;
    const _chatInput = document.getElementById('chat-input');
    if (_chatInput && document.activeElement === _chatInput) return;

    if (e.code === 'KeyT') {
        const chatInputWrapper = document.getElementById('chat-input-wrapper');
        const chatInput = document.getElementById('chat-input');
        if (chatInputWrapper && chatInput && document.activeElement !== chatInput) {
            e.preventDefault();
            chatInputWrapper.style.display = 'flex';
            chatInput.focus();
            document.exitPointerLock();
            return;
        }
    }

    if (e.code === 'KeyG' && gameStarted && !isDeadLocal) {
        if (isInGameGunEditing) closeInGameGunEditor(); else openInGameGunEditor();
        return;
    }

    switch (e.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'ShiftLeft': case 'ShiftRight': isCrouching = true; break;
        case 'Space': performJump(); break;
    }
}

function onKeyUp(e) {
    if (!gameStarted) return;
    const _chatInput = document.getElementById('chat-input');
    if (_chatInput && document.activeElement === _chatInput) return;
    switch (e.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'ShiftLeft': case 'ShiftRight': isCrouching = false; break;
    }
}

function shoot(e) {
    if (!isLocked || e.button !== 0 || isDeadLocal || !gameStarted) return;
    if (isInGameGunEditing) return;
    // EDITOR SIRF G SE: bande par fire karne se editor KABHI nahi khulega.
    // Click hamesha goli hi hai — gun click wala rasta poora hata diya
    // hai, kyunki wo fire karte waqt panel khol deta tha aur banda
    // marta hi nahi tha. Panel kholne ke liye sirf G dabao.
    playSound('shoot');
    muzzleFlash.visible = true;
    setTimeout(() => { muzzleFlash.visible = false; }, 60);

    scene.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(targets, true);

    if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        if (hitMesh.userData && hitMesh.userData.id) {
            const targetId = hitMesh.userData.id;
            const part = hitMesh.userData.bodyPart;
            let damage = part === 'head' ? 100 : 50;
            triggerHitMarker(part === 'head');
            playSound('hit');
            spawnBloodSplatter(intersects[0].point);
            socket.emit('playerHit', { targetId, damage, x: intersects[0].point.x, y: intersects[0].point.y, z: intersects[0].point.z });
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!gameStarted) {
        try {
            if (clock) clock.getDelta();
            if (gun) gun.visible = false;
            if (!lobbyCharacter) { try { createLobbyCharacter(); } catch (e) {} }
            if (lobbyScene && lobbyCamera && renderer) {
                lobbyCamera.aspect = window.innerWidth / window.innerHeight;
                lobbyCamera.updateProjectionMatrix();
                lobbyCamera.position.set(0, 1.4, 3.4);
                lobbyCamera.lookAt(0, lobbyPlayerSize, 0);
                renderer.render(lobbyScene, lobbyCamera);
            }
        } catch (e) {}
        return;
    }

    const delta = clock.getDelta();
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw + headYaw;
    camera.rotation.x = pitch;

    for (let i = bloodParticles.length - 1; i >= 0; i--) {
        const p = bloodParticles[i];
        p.life -= delta;
        p.velocity.y -= 15 * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
        if (p.life <= 0) {
            scene.remove(p.mesh);
            bloodParticles.splice(i, 1);
        }
    }

    Object.keys(otherPlayers).forEach(id => {
        const p = otherPlayers[id];
        if (p.isDead) {
            p.mesh.rotation.order = 'YXZ';
            p.mesh.rotation.x = THREE.MathUtils.lerp(p.mesh.rotation.x, -Math.PI / 2, delta * 8);
            p.mesh.rotation.z = THREE.MathUtils.lerp(p.mesh.rotation.z, -0.5, delta * 8);
            p.mesh.position.y = THREE.MathUtils.lerp(p.mesh.position.y, 0.2, delta * 8);

            p.mesh.traverse(child => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => {
                            m.transparent = true;
                            m.opacity = Math.max(0, m.opacity - delta * 0.35);
                        });
                    } else {
                        child.material.transparent = true;
                        child.material.opacity = Math.max(0, child.material.opacity - delta * 0.35);
                    }
                }
            });

            if (p.nameTag && p.nameTag.material) {
                p.nameTag.material.opacity = Math.max(0, p.nameTag.material.opacity - delta * 0.35);
                if (p.nameTag.material.opacity <= 0.05) {
                    p.nameTag.visible = false;
                }
            }
        } else if (p.parts && p.parts.leftLeg && p.parts.leftKneeMesh && p.parts.rightLeg && p.parts.rightKneeMesh) {
            // 🚶 WALK ANIMATION (knee joint se neeche wala hissa):
            // Server isMoving bhejta hai, aur position change bhi check
            // hoti hai, taake packet miss bhi ho to walk na ruke.
            // Local +Z = chalne ki direction (mesh +PI rotate ke baad):
            // thigh aage jhule to rotation.x negative, aur us waqt knee
            // bend positive hota hai taake shin (knee se neeche) peeche
            // ki taraf mude — bilkul insan ke ghutne ki tarah. Rukne par
            // walkAmount dheere dheere 0 ho jata hai, taake pair jhatke
            // se seedhe na hon, smoothly apni base pose par aa jayen.
            let speed = 0;
            if (p.lastPos) {
                const dx = p.mesh.position.x - p.lastPos.x;
                const dz = p.mesh.position.z - p.lastPos.z;
                speed = Math.hypot(dx, dz) / Math.max(delta, 0.001);
            }
            p.lastPos = p.mesh.position.clone();
            const moving = p.isMoving || speed > 0.8;
            p.walkAmount = THREE.MathUtils.lerp(p.walkAmount || 0, moving ? 1 : 0, delta * 8);
            if (moving) p.walkPhase = (p.walkPhase || 0) + delta * (6 + Math.min(speed, 14) * 0.55);
            const ph = p.walkPhase || 0;
            const amt = p.walkAmount || 0;
            const baseLegL = (typeof lobbyCustomParts !== 'undefined' && lobbyCustomParts.leftLeg) ? lobbyCustomParts.leftLeg.rotX : 0;
            const baseLegR = (typeof lobbyCustomParts !== 'undefined' && lobbyCustomParts.rightLeg) ? lobbyCustomParts.rightLeg.rotX : 0;
            const baseKneeL = (typeof lobbyCustomParts !== 'undefined' && lobbyCustomParts.leftKnee) ? lobbyCustomParts.leftKnee.rotX : 0;
            const baseKneeR = (typeof lobbyCustomParts !== 'undefined' && lobbyCustomParts.rightKnee) ? lobbyCustomParts.rightKnee.rotX : 0;
            const swingL = Math.sin(ph) * 0.55;
            const swingR = Math.sin(ph + Math.PI) * 0.55;
            const kneeL = Math.max(0, Math.sin(ph - 0.5)) * 0.95;
            const kneeR = Math.max(0, Math.sin(ph + Math.PI - 0.5)) * 0.95;
            p.parts.leftLeg.rotation.x = baseLegL - swingL * amt;
            p.parts.rightLeg.rotation.x = baseLegR - swingR * amt;
            p.parts.leftKneeMesh.rotation.x = baseKneeL + kneeL * amt;
            p.parts.rightKneeMesh.rotation.x = baseKneeR + kneeR * amt;
        }
    });

    if ((isLocked || isMobile) && !isDeadLocal) {
        targetPlayerHeight = isCrouching ? 1.0 : 1.62;
        playerHeight += (targetPlayerHeight - playerHeight) * 15.0 * delta;
        let moveSpeed = isCrouching ? 6.0 : 12.0;

        let inputX = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
        let inputZ = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0);
        const isMoving = (inputX !== 0 || inputZ !== 0);

        const moveVector = new THREE.Vector3();
        if (isMoving) {
            const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + headYaw);
            const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + headYaw);
            moveVector.addScaledVector(forward, inputZ);
            moveVector.addScaledVector(side, inputX);
            moveVector.normalize();
        }

        camera.position.addScaledVector(moveVector, moveSpeed * delta);
        velocity.y -= 32.0 * delta; 
        camera.position.y += velocity.y * delta;

        if (camera.position.y <= playerHeight) {
            velocity.y = 0;
            canJump = true;
            camera.position.y = playerHeight;
        }

        socket.emit('playerMovement', {
            x: camera.position.x, y: camera.position.y, z: camera.position.z,
            yaw: yaw + headYaw, pitch: pitch, isMoving: isMoving, isCrouching: isCrouching
        });
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}