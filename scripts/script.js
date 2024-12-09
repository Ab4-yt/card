const userID = "1061407057821053020"; // Thay đổi thành ID Discord của bạn

const elements = {
	statusBox: document.querySelector(".status"),
	statusImage: document.getElementById("status-image"),
	displayName: document.querySelector(".display-name"),
	username: document.querySelector(".username"),
	customStatus: document.querySelector(".custom-status"),
	customStatusText: document.querySelector(".custom-status-text"),
	customStatusEmoji: document.getElementById("custom-status-emoji"),
	customStatusApplication: document.getElementById("application-id"),
};

// Kết nối WebSocket với Lanyard API
function startWebSocket() {
	const ws = new WebSocket("wss://api.lanyard.rest/socket");

	ws.onopen = () => {
		ws.send(
			JSON.stringify({
				op: 2, // Subscribe operation
				d: {
					subscribe_to_id: userID,
				},
			})
		);
	};

	ws.onmessage = (event) => {
		const { t, d } = JSON.parse(event.data);
		if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
			updateStatus(d);
		}
	};

	ws.onerror = (error) => {
		console.error("Lỗi WebSocket:", error);
		ws.close();
	};

	ws.onclose = () => {
		console.log("WebSocket đóng, thử kết nối lại...");
		setTimeout(startWebSocket, 1000); // Tự động kết nối lại sau 1 giây
	};
}

function updateStatus(lanyardData) {
	const { discord_status, activities, discord_user } = lanyardData;

	elements.username.innerHTML = discord_user.username;
	elements.displayName.innerHTML = discord_user.display_name

	let imagePath;
	let label;

	// Xác định đường dẫn hình ảnh và nhãn theo trạng thái
	switch (discord_status) {
		case "online":
			imagePath = "./public/status/online.svg";
			label = "Online";
			break;
		case "idle":
			imagePath = "./public/status/idle.svg";
			label = "Idle / AFK";
			break;
		case "dnd":
			imagePath = "./public/status/dnd.svg";
			label = "Do Not Disturb";
			break;
		case "offline":
			imagePath = "./public/status/offline.svg";
			label = "Offline";
			break;
		default:
			imagePath = "./public/status/offline.svg";
			label = "Unknown";
			break;
	}

	// Kiểm tra hoạt động streaming
	const isStreaming = activities.some(
		(activity) =>
			activity.type === 1 &&
			(activity.url.includes("twitch.tv") ||
				activity.url.includes("youtube.com"))
	);

	if (isStreaming) {
		imagePath = "./public/status/streaming.svg";
		label = "Streaming";
	}

	// Cập nhật hình ảnh và tooltip cho trạng thái
	elements.statusImage.src = imagePath;
	elements.statusBox.setAttribute("aria-label", label);

	// Cập nhật custom status
	if (activities[0]?.state) {
		elements.customStatusText.innerHTML = activities[0].state;
	} else {
		elements.customStatusText.innerHTML = "Not doing anything!";
	}

	// Kiểm tra emoji
	const application_id = activities[0]?.application_id;
	if (application_id?.id) {
		const small_image = activities[0]?.small_image;
	if (small_image?.id) {
		// Sử dụng emoji có ID
		elements.customStatusApplication.src = `https://cdn.discordapp.com/app-assets/${application_id.id}/${small_image.id}.png`;
	} else if (small_text?.name) {
		// Nếu không có ID, sử dụng hình ảnh mặc định
		elements.customStatusApplication.src = "https://kirka-io-team.github.io/card/public/icons/poppy.png";
	} else {
		elements.customStatusApplication.style.display = "none";
	}

	// Hiển thị hoặc ẩn custom status
	if (!activities[0]?.state && !emoji) {
		elements.customStatus.style.display = "none";
	} else {
		elements.customStatus.style.display = "flex";
	}
}

// Bắt đầu WebSocket
startWebSocket();
