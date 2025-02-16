import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getDatabase, ref, push, onValue 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ===== 1️⃣ Cấu hình Firebase =====
const firebaseConfig = {
    apiKey: "AIzaSyAuyT3yyEN0gujcCwFBSFkyx41DuRQmJB8",
    authDomain: "baotuong8-3.firebaseapp.com",
    databaseURL: "https://baotuong8-3-default-rtdb.asia-southeast1.firebasedatabase.app/", // Quan trọng để dùng Realtime Database
    projectId: "baotuong8-3",
    storageBucket: "baotuong8-3.appspot.com",
    messagingSenderId: "13214429736",
    appId: "1:13214429736:web:f377d1ce656b0df28cbb1d"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ===== 2️⃣ Xử lý Đăng nhập / Đăng ký =====
// DOM Elements
const loginBtn = document.getElementById("open-login");
const logoutBtn = document.getElementById("logout-btn");
const popup = document.getElementById("auth-popup");
const authTitle = document.getElementById("auth-title");
const authActionBtn = document.getElementById("auth-action");
const toggleAuth = document.getElementById("toggle-auth");
const closePopup = document.getElementById("close-popup");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let isRegistering = false;

// Cập nhật giao diện
function updateAuthUI(user) {
    if (user) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}

// Kiểm tra trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
});

// Mở popup đăng nhập
loginBtn.addEventListener("click", () => popup.style.display = "block");
closePopup.addEventListener("click", () => popup.style.display = "none");

// Chuyển đổi giữa Đăng ký / Đăng nhập
toggleAuth.addEventListener("click", () => {
    isRegistering = !isRegistering;
    authTitle.innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    authActionBtn.innerText = isRegistering ? "Đăng ký" : "Đăng nhập";
    toggleAuth.innerHTML = isRegistering
        ? 'Đã có tài khoản? <span>Đăng nhập</span>'
        : 'Chưa có tài khoản? <span>Đăng ký</span>';
});

// Xử lý Đăng nhập / Đăng ký
authActionBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // Ngăn reload trang

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
        alert("Vui lòng nhập email và mật khẩu!");
        return;
    }

    try {
        if (isRegistering) {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Đăng ký thành công! Hãy đăng nhập.");
            isRegistering = false;
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            popup.style.display = "none";
        }
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
});

// Đăng xuất
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Bạn đã đăng xuất.");
});

// ===== 3️⃣ Xử lý Bình luận =====
// DOM Elements
const form = document.getElementById("comment-form");
const commentInput = document.getElementById("comment");
const commentList = document.getElementById("comment-list");

// Xử lý Gửi bình luận
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        alert("Bạn cần đăng nhập để bình luận!");
        return;
    }

    const name = user.email; // Hoặc user.displayName nếu có
    const comment = commentInput.value.trim();

    if (!comment) return;

    const dbRef = ref(db, "comments");

    try {
        await push(dbRef, {
            name: name,
            comment: comment,
            timestamp: Date.now()
        });

        console.log("Bình luận đã được gửi thành công!");
    } catch (error) {
        console.error("Lỗi khi gửi bình luận:", error);
    }

    form.reset();
});

// Hiển thị Bình luận từ Firebase
onValue(ref(db, "comments"), (snapshot) => {
    console.log("Dữ liệu từ Firebase:", snapshot.val());
    commentList.innerHTML = "";

    if (snapshot.exists()) {
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.innerHTML = `<strong>${data.name}:</strong> ${data.comment}`;
            commentList.appendChild(li);
        });
    } else {
        commentList.innerHTML = "<li>Chưa có bình luận nào.</li>";
    }
});