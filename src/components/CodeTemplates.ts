export const MYSQL_SCHEMA = `-- ==========================================
-- TELEGRAM POST FORWARDING DATABASE SCHEMA
-- ==========================================
CREATE DATABASE IF NOT EXISTS \`telegram_forwarder\`;
USE \`telegram_forwarder\`;

-- 1. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS \`plans\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`name\` VARCHAR(50) NOT NULL UNIQUE,
  \`price_monthly\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`price_yearly\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`max_source_channels\` INT NOT NULL DEFAULT 3,
  \`max_destination_channels\` INT NOT NULL DEFAULT 3,
  \`daily_forward_limit\` INT NOT NULL DEFAULT 100,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Populate default plans
INSERT INTO \`plans\` (\`name\`, \`price_monthly\`, \`price_yearly\`, \`max_source_channels\`, \`max_destination_channels\`, \`daily_forward_limit\`) VALUES
('Free Tier', 0.00, 0.00, 2, 2, 50),
('Standard Plan', 15.00, 120.00, 10, 10, 500),
('VIP Enterprise', 45.00, 360.00, 50, 50, 5000)
ON DUPLICATE KEY UPDATE \`price_monthly\`=\`price_monthly\`;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  \`plan_id\` INT NOT NULL DEFAULT 1,
  \`plan_expire_date\` DATE NULL,
  \`balance\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`api_token\` VARCHAR(64) UNIQUE NOT NULL, -- For VPS Daemon authentication
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`plan_id\`) REFERENCES \`plans\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default Admin accounts (Password: admin123)
-- In production, hash this password using PHP password_hash()!
INSERT INTO \`users\` (\`username\`, \`email\`, \`password_hash\`, \`role\`, \`plan_id\`, \`balance\`, \`api_token\`) VALUES
('admin', 'admin@forwarder.com', '$2y$10$wKx60R8K8O6hH4oF8aY6uOmVq7X6S2N6q9uXl4G1jG/xZ4T52E1S6', 'admin', 3, 999.00, 'adm_token_super_secret_99999a')
ON DUPLICATE KEY UPDATE \`username\`=\`username\`;

-- 3. TELEGRAM SESSIONS TABLE
CREATE TABLE IF NOT EXISTS \`telegram_sessions\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`user_id\` INT NOT NULL,
  \`phone_number\` VARCHAR(20) NOT NULL,
  -- Encrypted using AES-256-CBC at the PHP layer
  \`session_string\` TEXT NOT NULL,
  \`status\` ENUM('active', 'expired', 'connecting') DEFAULT 'connecting',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY \`phone_user\` (\`user_id\`, \`phone_number\`),
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. FORWARDING RULES TABLE
CREATE TABLE IF NOT EXISTS \`rules\` (
  \`id\` INT PRIMARY KEY AUTO_INCREMENT,
  \`user_id\` INT NOT NULL,
  \`session_id\` INT NOT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  -- Stored as comma-separated or JSON
  \`sources\` TEXT NOT NULL, -- e.g. "@group_a,@news_b,-1001234567"
  \`destinations\` TEXT NOT NULL, -- e.g. "@my_channel_c,-1009876543"
  \`keyword_includes\` TEXT NULL, -- comma-separated
  \`keyword_excludes\` TEXT NULL, -- comma-separated
  \`filter_text\` TINYINT(1) DEFAULT 1,
  \`filter_photo\` TINYINT(1) DEFAULT 1,
  \`filter_video\` TINYINT(1) DEFAULT 1,
  \`filter_document\` TINYINT(1) DEFAULT 1,
  \`filter_animation\` TINYINT(1) DEFAULT 1,
  \`forward_as_copy\` TINYINT(1) DEFAULT 1, -- Removes forward tag
  \`is_enabled\` TINYINT(1) DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`session_id\`) REFERENCES \`telegram_sessions\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SYSTEM FORWARDING AUDIT LOGS
CREATE TABLE IF NOT EXISTS \`logs\` (
  \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
  \`user_id\` INT NOT NULL,
  \`rule_id\` INT NOT NULL,
  \`session_id\` INT NOT NULL,
  \`source_chat\` VARCHAR(100) NOT NULL,
  \`destination_chat\` VARCHAR(100) NOT NULL,
  \`message_type\` VARCHAR(20) NOT NULL,
  \`status\` ENUM('success', 'filtered_keyword', 'filtered_media', 'failed') NOT NULL,
  \`action_taken\` VARCHAR(255) NOT NULL,
  \`timestamp\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`rule_id\`) REFERENCES \`rules\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INDEXES FOR INSTANT RESPONSIVE QUERIES
CREATE INDEX \`idx_users_token\` ON \`users\`(\`api_token\`);
CREATE INDEX \`idx_rules_user\` ON \`rules\`(\`user_id\`);
CREATE INDEX \`idx_rules_enabled\` ON \`rules\`(\`is_enabled\`);
CREATE INDEX \`idx_logs_timestamp\` ON \`logs\`(\`timestamp\`);
`;

export const PHP_DATABASE = `<?php
/**
 * config/database.php - PDO Connection & Encryption Helpers
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'telegram_forwarder');
define('DB_USER', 'root'); // Replace with your cPanel database user
define('DB_PASS', '');     // Replace with your cPanel database password

// AES-256 decryption key for stored Telegram sessions
define('ENCRYPTION_KEY', 'xS6!9_vLz-a3_QpWeRtYuIoTgHbNkMjU'); 

class Database {
    private static $instance = null;

    public static function getConnection() {
        if (self::$instance === null) {
            try {
                self::$instance = new PDO(
                    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                    DB_USER,
                    DB_PASS,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                die("Database connection error: " . $e->getMessage());
            }
        }
        return self::$instance;
    }

    /**
     * Secures and stores the session strings using AES-256 CBC
     */
    public static function encrypt($data) {
        $key = hash('sha256', ENCRYPTION_KEY, true);
        $iv = openssl_random_pseudo_bytes(16);
        $ciphertext = openssl_encrypt($data, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return base64_encode($iv . $ciphertext);
    }

    /**
     * Decrypts standard Telegram session strings securely
     */
    public static function decrypt($data) {
        $data = base64_decode($data);
        $iv = substr($data, 0, 16);
        $ciphertext = substr($data, 16);
        $key = hash('sha256', ENCRYPTION_KEY, true);
        return openssl_decrypt($ciphertext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
    }
}
`;

export const PHP_AUTH_CONTROLLER = `<?php
/**
 * controllers/AuthController.php - Secure User Signup & Login Management
 */

require_once __DIR__ . '/../config/database.php';

class AuthController {
    
    /**
     * Register a new user and assign default FREE tier resources
     */
    public static function register($username, $email, $password) {
        $db = Database::getConnection();
        
        // Input sanitization & validation
        $username = trim(filter_var($username, FILTER_SANITIZE_SPECIAL_CHARS));
        $email = filter_var($email, FILTER_VALIDATE_EMAIL);
        
        if (!$username || !$email || strlen($password) < 6) {
            return ["success" => false, "msg" => "Invalid inputs. Password must be >= 6 characters."];
        }

        // Check if user or email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            return ["success" => false, "msg" => "Username or Email already registered."];
        }

        // Setup security parameters
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $apiToken = bin2hex(random_bytes(32)); // Generates exclusive access token for standard VPS API calls

        // Insert database record
        $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, plan_id, balance, api_token) VALUES (?, ?, ?, 1, 0.00, ?)");
        try {
            $stmt->execute([$username, $email, $passwordHash, $apiToken]);
            return ["success" => true, "msg" => "Account created! You can now log in."];
        } catch (PDOException $e) {
            return ["success" => false, "msg" => "Registration error: " . $e->getMessage()];
        }
    }

    /**
     * Login User and store credentials cleanly in Session
     */
    public static function login($username, $password) {
        $db = Database::getConnection();
        $username = trim($username);

        $stmt = $db->prepare("SELECT u.*, p.name as plan_name FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.username = ? OR u.email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            if (session_status() == PHP_SESSION_NONE) {
                session_start();
            }
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['plan_name'] = $user['plan_name'];
            $_SESSION['api_token'] = $user['api_token'];
            return ["success" => true, "msg" => "Logged in successfully!"];
        }

        return ["success" => false, "msg" => "Invalid credentials. Try again."];
    }

    public static function logout() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
        return true;
    }
}
`;

export const PHP_RULE_CONTROLLER = `<?php
/**
 * controllers/RuleController.php - Creating and Editing Custom Rules
 */

require_once __DIR__ . '/../config/database.php';

class RuleController {
    
    /**
     * Get rules and map plan tier checks
     */
    public static function getUserRules($userId) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT r.*, s.phone_number FROM rules r JOIN telegram_sessions s ON r.session_id = s.id WHERE r.user_id = ? ORDER BY r.id DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Save a new dynamic Forwarding Rule based on Plan restrictions
     */
    public static function createRule($userId, $data) {
        $db = Database::getConnection();

        // 1. Fetch User details for validation against Plan limits
        $stmt = $db->prepare("SELECT u.*, p.max_source_channels, p.max_destination_channels FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            return ["success" => false, "msg" => "User not found."];
        }

        // Parse sources and destinations
        $srcArray = array_filter(array_map('trim', explode(',', $data['sources'])));
        $dstArray = array_filter(array_map('trim', explode(',', $data['destinations'])));

        // 2. Enforce standard telecom forwarding structural boundaries
        if (count($srcArray) > $user['max_source_channels']) {
            return ["success" => false, "msg" => "Your subscription allows a maximum of " . $user['max_source_channels'] . " source channels."];
        }
        if (count($dstArray) > $user['max_destination_channels']) {
            return ["success" => false, "msg" => "Your subscription allows a maximum of " . $user['max_destination_channels'] . " destination channels."];
        }

        // Clean arrays back to compact string representations
        $sourcesStr = implode(',', $srcArray);
        $destinationsStr = implode(',', $dstArray);

        // Sanitize keyword arrays
        $includes = isset($data['keyword_includes']) ? implode(',', array_filter(array_map('trim', explode(',', $data['keyword_includes'])))) : null;
        $excludes = isset($data['keyword_excludes']) ? implode(',', array_filter(array_map('trim', explode(',', $data['keyword_excludes'])))) : null;

        $filterText = isset($data['filter_text']) ? 1 : 0;
        $filterPhoto = isset($data['filter_photo']) ? 1 : 0;
        $filterVideo = isset($data['filter_video']) ? 1 : 0;
        $filterDoc = isset($data['filter_document']) ? 1 : 0;
        $filterAnim = isset($data['filter_animation']) ? 1 : 0;
        $copyMode = isset($data['forward_as_copy']) ? 1 : 0;

        $stmt = $db->prepare("INSERT INTO rules (user_id, session_id, name, sources, destinations, keyword_includes, keyword_excludes, filter_text, filter_photo, filter_video, filter_document, filter_animation, forward_as_copy, is_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        try {
            $stmt->execute([
                $userId,
                $data['session_id'],
                trim(filter_var($data['name'], FILTER_SANITIZE_SPECIAL_CHARS)),
                $sourcesStr,
                $destinationsStr,
                $includes,
                $excludes,
                $filterText,
                $filterPhoto,
                $filterVideo,
                $filterDoc,
                $filterAnim,
                $copyMode
            ]);
            return ["success" => true, "msg" => "Post Forwarding Rule created successfully! Your VPS agent will synchronize shortly."];
        } catch (PDOException $e) {
            return ["success" => false, "msg" => "Error creating rule: " . $e->getMessage()];
        }
    }

    public static function toggleRule($userId, $ruleId, $isEnabled) {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE rules SET is_enabled = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$isEnabled ? 1 : 0, $ruleId, $userId]);
        return ["success" => true, "msg" => "Rule state updated."];
    }
}
`;

export const PHP_API_SYNC = `<?php
/**
 * api/get_tasks.php - VPS Python Userbot Endpoint
 * 
 * Secure REST interface so that the VPS runner doesn't require open 
 * connection ports directly into MySQL, improving enterprise cPanel configurations.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Authenticate via exclusive User API Token header
$headers = getallheaders();
$apiToken = isset($headers['X-Daemon-Token']) ? trim($headers['X-Daemon-Token']) : '';

if (empty($apiToken)) {
    http_response_code(401);
    echo json_encode(["error" => "Authorization API token required."]);
    exit;
}

$db = Database::getConnection();

// Validate token and extract active sessions
$stmt = $db->prepare("SELECT id, username, plan_id FROM users WHERE api_token = ?");
$stmt->execute([$apiToken]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(403);
    echo json_encode(["error" => "Invalid API token. Access denied."]);
    exit;
}

// Check action types
$action = isset($_GET['action']) ? $_GET['action'] : 'sync';

if ($action === 'sync') {
    // 1. Fetch encrypted user sessions
    $sessStmt = $db->prepare("SELECT id, phone_number, session_string, status FROM telegram_sessions WHERE user_id = ?");
    $sessStmt->execute([$user['id']]);
    $sessions = $sessStmt->fetchAll();

    // Decrypt the session strings safely before transporting to VPS over HTTPS
    foreach ($sessions as &$sess) {
        $sess['session_string'] = Database::decrypt($sess['session_string']);
    }

    // 2. Fetch the forwarding rules associated with these sessions
    $rulesStmt = $db->prepare("SELECT * FROM rules WHERE user_id = ? AND is_enabled = 1");
    $rulesStmt->execute([$user['id']]);
    $rules = $rulesStmt->fetchAll();

    echo json_encode([
        "user_id" => $user['id'],
        "username" => $user['username'],
        "sessions" => $sessions,
        "rules" => $rules
    ]);
    exit;

} elseif ($action === 'log') {
    // 3. Receive logs from Pyrogram daemon
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['rule_id']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(["error" => "Incorrect log payload properties."]);
        exit;
    }

    $logStmt = $db->prepare("INSERT INTO logs (user_id, rule_id, session_id, source_chat, destination_chat, message_type, status, action_taken) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    try {
        $logStmt->execute([
            $user['id'],
            $input['rule_id'],
            $input['session_id'],
            $input['source_chat'],
            $input['destination_chat'],
            $input['message_type'],
            $input['status'],
            $input['action_taken']
        ]);
        echo json_encode(["status" => "logged_successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}
`;

export const PYTHON_PYROGRAM_ENGINE = `#!/usr/bin/env python3
"""
forwarder.py - 24/7 VPS Telegram Post Forwarding Daemon

This script connects to your PHP Web Panel API, downloads decrypted session
strings and active forwarding rules, links multiple clients concurrently using 
Pyrogram event handlers, and forwards media assets safely while obeying rate limit constraints.
"""

import sys
import os
import asyncio
import logging
import requests
from pyrogram import Client, filters, errors
from pyrogram.types import Message

# Configure clean logging output with terminal timestamps
logging.basicConfig(
    format="%(asctime)s [%(levelname)s] - %(name)s: %(message)s",
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("forwarder.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("TG_Forwarder")

# VPS Configurations
PANEL_URL = "https://your-cpanel-domain.com/api/get_tasks.php"
DAEMON_TOKEN = "your_exclusive_user_api_token_here"
SYNC_INTERVAL = 300  # Sync with web panel every 5 minutes to fetch rules

# Keep references to API app_id and app_hash (get yours from my.telegram.org)
API_ID = 1234567       # <-- Override in production
API_HASH = "your_api_hash_here_abcdef1231" 

# Global state trackers for active users & clients
# Structure: { session_id: { "client": Client, "rules": [rules_list] } }
active_workers = {}

def fetch_configurations():
    """
    HTTP proxy to load active sessions & rules safely without VPS DB port bindings.
    """
    headers = {"X-Daemon-Token": DAEMON_TOKEN}
    try:
        response = requests.get(f"{PANEL_URL}?action=sync", headers=headers, timeout=15)
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"Fails synchronization sync. Status Code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error during configuration retrieval: {e}")
    return None

def submit_task_log(session_id, rule_id, src, dst, media_type, status, action):
    """
    Submits a structural forward operation to the panel audits database.
    """
    headers = {
        "X-Daemon-Token": DAEMON_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "session_id": session_id,
        "rule_id": rule_id,
        "source_chat": src,
        "destination_chat": dst,
        "message_type": media_type,
        "status": status,
        "action_taken": action
    }
    try:
        requests.post(f"{PANEL_URL}?action=log", headers=headers, json=payload, timeout=10)
    except Exception as e:
        logger.warning(f"Failed to transmit operational audit log: {e}")

def matches_filters(message: Message, rule):
    """
    Determines if message content maps securely within user constraints.
    """
    text_content = message.text or message.caption or ""
    
    # Check media types first
    msg_type = "text"
    if message.photo:
        msg_type = "photo"
    elif message.video:
        msg_type = "video"
    elif message.document:
        msg_type = "document"
    elif message.animation:
        msg_type = "animation"

    # Rule filter state flags
    filter_map = {
        "text": rule.get("filter_text"),
        "photo": rule.get("filter_photo"),
        "video": rule.get("filter_video"),
        "document": rule.get("filter_document"),
        "animation": rule.get("filter_animation")
    }

    if not filter_map.get(msg_type, True):
        return False, "filtered_media", f"Skipped: User disabled '{msg_type}' in criteria tags."

    # Analyze keyword inclusions
    includes = rule.get("keyword_includes")
    if includes:
        inc_list = [x.strip().lower() for x in includes.split(",") if x.strip()]
        if inc_list:
            matched_inc = any(kw in text_content.lower() for kw in inc_list)
            if not matched_inc:
                return False, "filtered_keyword", "Skipped: Did not contain requested input keywords."

    # Analyze keyword exclusions
    excludes = rule.get("keyword_excludes")
    if excludes:
        exc_list = [x.strip().lower() for x in excludes.split(",") if x.strip()]
        for kw in exc_list:
            if kw and kw in text_content.lower():
                return False, "filtered_keyword", f"Skipped: Contained excluded word '{kw}'."

    return True, "success", msg_type

async def process_incoming_post(client: Client, message: Message, rule, session_id):
    """
    Forwards or copies message objects respecting API flood triggers.
    """
    src_title = message.chat.username or str(message.chat.id)
    is_valid, status_code, details_or_type = matches_filters(message, rule)

    if not is_valid:
        # Submit audit skipping records for rule tuning observability
        for dest in rule["destinations"].split(","):
            submit_task_log(session_id, rule["id"], src_title, dest.strip(), "unmatched", status_code, details_or_type)
        return

    destinations = [x.strip() for x in rule["destinations"].split(",") if x.strip()]
    media_type = details_or_type

    for dest in destinations:
        try:
            if rule.get("forward_as_copy"):
                # Copying removes the sender's original "Forwarded from" tags
                await message.copy(chat_id=dest)
                action_text = "Forwarded as Copy (Original Tag Cleared)"
            else:
                # Standard forward preserves the original sender details
                await message.forward(chat_id=dest)
                action_text = "Standard Forward"

            logger.info(f"Rule [{rule['name']}] Successfully routed from {src_title} -> {dest}")
            submit_task_log(session_id, rule["id"], src_title, dest, media_type, "success", action_text)
            await asyncio.sleep(1.5) # Guard spacing delay between sequential destination deliveries

        except errors.FloodWait as e:
            logger.warning(f"Telegram Limit Warning: Flood Wait trigger! Cooling down for {e.value}s")
            submit_task_log(session_id, rule["id"], src_title, dest, media_type, "failed", f"Limit Error: Flood wait cooldown needed for {e.value} seconds.")
            await asyncio.sleep(e.value + 2) # Strict wait before continuing operations
            
        except Exception as e:
            logger.error(f"Rule Delivery Error: {e}")
            submit_task_log(session_id, rule["id"], src_title, dest, media_type, "failed", f"API Error: {str(e)}")

# Setting up dynamic handler registering
# Pyrogram processes events via Asyncio background task executions.
def setup_handlers(client_instance: Client, session_id):
    
    @client_instance.on_message(filters.incoming)
    async def global_router(client, message: Message):
        if not message.chat:
            return

        # Double security key checks
        user_channel_id = str(message.chat.id)
        user_channel_user = f"@{message.chat.username}" if message.chat.username else ""

        # Query matches for current user's rules
        worker_config = active_workers.get(session_id, {})
        for rule in worker_config.get("rules", []):
            sources = [x.strip().lower() for x in rule["sources"].split(",") if x.strip()]
            
            # Map source identities against message emitters
            is_matched_source = False
            for src in sources:
                if src.startswith("-100"): # Match by Channel ID
                    if src == user_channel_id:
                        is_matched_source = True
                else: # Match by username handle
                    src_clean = src if src.startswith("@") else f"@{src}"
                    if src_clean == user_channel_user.lower():
                        is_matched_source = True

            if is_matched_source:
                # Trigger pipeline task in async event loop
                asyncio.create_task(process_incoming_post(client, message, rule, session_id))

async def manage_daemon():
    """
    Handles startup cycles, live state synchronization, and clean teardowns.
    """
    logger.info("Starting Telegram Post Forwarding Daemon on VPS...")
    logger.info("Initial sync in progress...")

    while True:
        configs = fetch_configurations()
        if configs:
            synced_session_ids = []
            
            # 1. Spawn and match incoming connections
            for session in configs["sessions"]:
                sess_id = session["id"]
                phone = session["phone_number"]
                session_str = session["session_string"]
                synced_session_ids.append(sess_id)

                # Filter and resolve related forwarding rules
                mapped_rules = [r for r in configs["rules"] if r["session_id"] == sess_id]

                if sess_id not in active_workers:
                    logger.info(f"Initiating Pyrogram client for registered user session ({phone})")
                    # Construct client from generated Pyrogram string SESSION
                    new_client = Client(
                        name=f"session_{sess_id}",
                        api_id=API_ID,
                        api_hash=API_HASH,
                        session_string=session_str,
                        no_updates=False # Must track inbound messages
                    )
                    
                    try:
                        await new_client.start()
                        setup_handlers(new_client, sess_id)
                        active_workers[sess_id] = {
                            "client": new_client,
                            "rules": mapped_rules,
                            "phone": phone
                        }
                        logger.info(f"Pyrogram connection online for session: {phone}")
                    except Exception as e:
                        logger.error(f"Failed to boot channel listener client for session {phone}: {e}")
                else:
                    # Session verified, update active dynamic rules directly
                    active_workers[sess_id]["rules"] = mapped_rules
                    logger.debug(f"Rules synchronized cleanly for phone {phone} (rules count: {len(mapped_rules)})")

            # 2. Shutdown removed or logged out sessions
            terminated_workers = [sid for sid in active_workers if sid not in synced_session_ids]
            for sid in terminated_workers:
                logger.info(f"Closing deleted user session connection: ID {sid}")
                try:
                    await active_workers[sid]["client"].stop()
                except Exception as e:
                    logger.warning(f"Session termination warning: {e}")
                active_workers.pop(sid, None)

        else:
            logger.warning("Dynamic rules collection pool sync failed. Retrying next cycle.")

        # Standby for next sync period
        await asyncio.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    try:
        asyncio.run(manage_daemon())
    except KeyboardInterrupt:
        logger.info("Core service manually terminated by administrator. Good evening.")
`;

export const VPS_DEPLOYMENT_GUIDE = `### VPS Setup & Maintenance Handbook
Learn how to launch, optimize, and safely secure your Python Pyrogram automation engine 24/7.

---

#### 1. VPS Host Setup Prerequisites
Pyrogram is a powerful asyncio framework. To get started, verify that Python 3.9+ is configured and update any local OS dependencies inside your Ubuntu server.

\`\`\`bash
# Update and install developer essentials safely
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv git screen tmux -y
\`\`\`

#### 2. Installing Python Packages
Always use a Python virtual environment to avoid colliding with default package managers. Execute these steps within your daemon's running directory:

\`\`\`bash
# Initialize a isolated python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Pyrogram and required crypto dependencies 
pip3 install --upgrade pip
pip3 install pyrogram tgcrypto requests mysql-connector-python
\`\`\`

#### 3. Continuous 24/7 Running via systemd (Recommended)
Creating a robust Linux systems daemon ensures that your forwarder automatically boots alongside the VPS, recovers instantly from cloud failures, and forwards incoming logs transparently to syslog.

Create a file named \`/etc/systemd/system/tg-forwarder.service\` using sudo:

\`\`\`ini
[Unit]
Description=Telegram 24/7 Post Forwarding Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/ubuntu/telegram-forwarder
ExecStart=/home/ubuntu/telegram-forwarder/venv/bin/python forwarder.py
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tg-forwarder

[Install]
WantedBy=multi-user.target
\`\`\`

Reload configuration and activate the service:

\`\`\`bash
# Refresh systemd configuration
sudo systemctl daemon-reload

# Start and enable the service on VPS startup
sudo systemctl start tg-forwarder
sudo systemctl enable tg-forwarder

# Inspect live status and operational streams
sudo systemctl status tg-forwarder
sudo journalctl -u tg-forwarder -f -n 100
\`\`\`

---

#### 4. Alternative Method: Running with Linux "Screen"
If you do not have root privileges to configure systemd, use standard screen terminals to run execution threads isolated in the background:

\`\`\`bash
# Launch a persistent visual workspace
screen -S tg-forwarder

# Inside the screen workspace, boot the script
source venv/bin/activate
python3 forwarder.py

# Detach using keyboard combo: Ctrl + A, then press D
# To re-attach to your active script at any time:
screen -r tg-forwarder
\`\`\`
`;

export const SECURITY_ANTIBAN_GUIDE = `### Security Handbook: Evasion of Bot-API Triggers & Telegram Bans
Telegram enforces strict algorithms to prevent mass scraping, spam, and unsolicited content syndication. If your Pyrogram userbot operates erratically, your account faces quick bans or permanent restrictions.

Follow these strict instructions to stay entirely under Telegram's spam radar:

---

#### 1. API App Identifiers Setup
Make sure you never hardcode a single public \`API_ID\` or \`API_HASH\` for multiple concurrent users in standard systems.
* Log into **https://my.telegram.org** using each phone number.
* Navigate to **API Development Tools** and register a unique customized applet.
* Expose these specialized ID/hashes to each userbot session. 

#### 2. Anti-Spam Spacing Cooldowns
* Standard forwarding commands (using \`message.forward()\` or \`message.copy()\`) are resource-intensive. If your rule triggers multi-channel forwards instantly, Telegram tags this as algorithmic bot behaviors.
* Maintain a secure delay of at least **1.5 to 3.0 seconds** between successive channel forwards within active handlers.
* For multi-destination rules, always space out deliveries.

#### 3. Avoid Using "Fresh" Phone Numbers
* **Strict Warning**: Signing up for a brand new SIM card and immediately spawning a Pyrogram userbot to forward 500 tech channels daily will flag your account for termination in minutes.
* Run "warming periods" (Account Heating) on any fresh phone account:
  * Connect the SIM card to a real mobile smartphone Telegram app first.
  * Send organic messages, join regular chatrooms, and keep active sessions for at least **7 to 10 days** prior to migrating details to userbot sessions.

#### 4. Limit the Counts of Monitored Sources
* Do not register more than **15-20 active groups or channels** inside a single Telegram userbot account rule.
* If your application needs to monitor 100 channels, split the payload among 5 distinct accounts (each with unique phone numbers and unique API App parameters).

#### 5. Simulate Accurate Device Information
When initializing Pyrogram clients, you can configure standard mock system parameters:
* Replace default system devices with realistic mobile user-agents (e.g., \`device_model="Samsung Galaxy S22"\`, \`system_version="Android 13"\`, \`app_version="9.6.1"\`). This prevents server-side tracking identifiers from matching Pyrogram defaults.

#### 6. Always Prefer "Forward as Copy"
* Using \`message.copy()\` is safer because it re-uploads the content directly rather than generating back-links to source channels. 
* Frequent back-linking to external channels flags internal anti-scraping system sensors.
`;
