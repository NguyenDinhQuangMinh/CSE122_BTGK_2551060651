const $ = s => document.querySelector(s);
const toast = $("#toast");
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function wireHeader(searchHandler) {
  const notice = $("#noticeMenu");
  const profile = $("#profileMenu");

  $("#noticeButton").addEventListener("click", () => {
    notice.hidden = !notice.hidden;
    profile.hidden = true;
  });

  $("#profileButton").addEventListener("click", () => {
    profile.hidden = !profile.hidden;
    notice.hidden = true;
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".popover-wrap")) {
      notice.hidden = true;
      profile.hidden = true;
    }
  });

  document.querySelectorAll('[data-action="logout"]').forEach(button => {
    button.addEventListener("click", () => {
      notify("Đăng xuất chỉ là thao tác minh họa.");
    });
  });

  $("#globalSearch").addEventListener("input", e => {
    if (searchHandler) searchHandler(e.target.value);
  });
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

const KEY = "craftlink-slide02-categories-slide-v2";
let items = [
  { id: "c1", name: "Gốm sứ thủ công", children: 3, products: 128, active: true, image: 1 },
  { id: "c2", name: "Đồ da cao cấp", children: 5, products: 96, active: true, image: 2 },
  { id: "c3", name: "Trang sức & Phụ kiện", children: 4, products: 156, active: true, image: 3 },
  { id: "c4", name: "Đồ gỗ nghệ thuật", children: 6, products: 203, active: true, image: 4 },
  { id: "c5", name: "Thêu dệt may mặc", children: 3, products: 74, active: false, image: 5 }
];
let query = "";

try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (Array.isArray(saved)) items = saved;
} catch {}

const form = $("#form");
const dialog = $("#editor");

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

function render() {
  const q = ($("#search").value || query).toLocaleLowerCase("vi");

  $("#rows").innerHTML = items
    .filter(item => item.name.toLocaleLowerCase("vi").includes(q))
    .map(item =>
      '<tr class="category-row">' +
        '<td><div class="category-name">' +
          '<img class="category-thumb" src="../assets/category-' +
          (item.image || 1) +
          '.png" alt=""><span>' + esc(item.name) + '</span>' +
        '</div></td>' +
        '<td>' + Number(item.children || 0) + '</td>' +
        '<td>' + Number(item.products || 0) + '</td>' +
        '<td><span class="status ' + (item.active ? "" : "off") + '">' +
          (item.active ? "Hiển thị" : "Ẩn") +
        '</span></td>' +
        '<td><div class="category-actions">' +
          '<button class="switch ' + (item.active ? "on" : "") +
            '" type="button" data-act="toggle" data-id="' + item.id +
            '" aria-label="' + (item.active ? "Ẩn" : "Hiển thị") + " " +
            esc(item.name) + '"></button>' +
          '<button class="action-btn icon-action" type="button" data-act="edit" data-id="' +
            item.id + '" aria-label="Sửa">✎ Sửa</button>' +
          '<button class="action-btn icon-action" type="button" data-act="delete" data-id="' +
            item.id + '" aria-label="Xóa">▤ Xóa</button>' +
        '</div></td>' +
      '</tr>'
    )
    .join("") ||
    '<tr><td colspan="5" class="empty">Không tìm thấy danh mục.</td></tr>';
}

function edit(item) {
  form.reset();
  form.elements.id.value = item?.id || "";
  form.elements.name.value = item?.name || "";
  form.elements.children.value = item?.children || 0;
  form.elements.products.value = item?.products || 0;
  $("#dialogTitle").textContent = item
    ? "Cập nhật danh mục"
    : "Thêm danh mục mới";
  dialog.showModal();
}

$("#add").addEventListener("click", () => edit());
$("#close").addEventListener("click", () => dialog.close());
$("#cancel").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close();
});

$("#search").addEventListener("input", () => render());

wireHeader(value => {
  query = value;
  $("#search").value = value;
  render();
});

$("#rows").addEventListener("click", e => {
  const button = e.target.closest("[data-act]");
  if (!button) return;

  const item = items.find(x => x.id === button.dataset.id);
  if (!item) return;

  if (button.dataset.act === "edit") return edit(item);

  if (button.dataset.act === "toggle") {
    item.active = !item.active;
    save();
    render();
    notify(item.active
      ? "Đã bật hiển thị danh mục."
      : "Đã ẩn danh mục.");
    return;
  }

  if (confirm("Xóa danh mục “" + item.name + "”?")) {
    items = items.filter(x => x !== item);
    save();
    render();
    notify("Đã xóa danh mục.");
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.reportValidity()) return;

  const id = form.elements.id.value;
  const old = items.find(x => x.id === id);
  const name = form.elements.name.value.trim();
  const item = {
    id: id || "c" + Date.now(),
    name,
    children: Number(form.elements.children.value) || 0,
    products: Number(form.elements.products.value) || 0,
    active: old?.active ?? true,
    image: old?.image || 1
  };

  items = old
    ? items.map(x => x.id === id ? item : x)
    : [...items, item];

  const ok = save();
  dialog.close();
  render();
  notify(ok
    ? (old ? "Đã cập nhật danh mục." : "Bạn đã thêm danh mục thành công.")
    : "Đã lưu trong phiên này; bộ nhớ trình duyệt không khả dụng.");
});

render();