// Injects the admin sidebar into #sidebarSlot
export function renderSidebar() {
  const slot = document.getElementById('sidebarSlot');
  if (!slot) return;
  slot.innerHTML = `
    <div><div class="sidebar-logo"><img src="/WebsiteLogo.png" alt="ClassMinds logo" style="height:24px;width:24px;vertical-align:middle;margin-right:8px"/>Class<span>Minds</span></div><div class="sidebar-user" id="sidebarUser"></div></div>
    <a class="nav-item" href="../home.html" style="background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);margin-bottom:8px"><span class="icon">&#127968;</span><span>User View</span></a>
    <div class="sidebar-label">Overview</div>
    <a class="nav-item" href="admin.html" data-page="admin.html"><span class="icon">&#128202;</span><span>Dashboard</span></a>
    <div class="sidebar-label">Beta Program</div>
    <a class="nav-item" href="admin-signups.html" data-page="admin-signups.html"><span class="icon">&#128101;</span><span>Signups</span></a>
    <a class="nav-item" href="admin-notify.html" data-page="admin-notify.html"><span class="icon">&#128276;</span><span>Notifications</span></a>
    <div class="sidebar-label">App</div>
    <a class="nav-item" href="admin-users.html" data-page="admin-users.html"><span class="icon">&#128100;</span><span>Users</span></a>
    <a class="nav-item" href="admin-create-user.html" data-page="admin-create-user.html"><span class="icon">&#10133;</span><span>Create User</span></a>
    <a class="nav-item" href="admin-classes.html" data-page="admin-classes.html"><span class="icon">&#127979;</span><span>Classes</span></a>
    <a class="nav-item" href="admin-schools.html" data-page="admin-schools.html"><span class="icon">&#127979;</span><span>Schools</span></a>
    <a class="nav-item" href="admin-schedules.html" data-page="admin-schedules.html"><span class="icon">&#128197;</span><span>Schedules</span></a>
    <a class="nav-item" href="admin-summaries.html" data-page="admin-summaries.html"><span class="icon">&#128196;</span><span>Summaries</span></a>
    <a class="nav-item" href="admin-trim-stats.html" data-page="admin-trim-stats.html"><span class="icon">&#9986;</span><span>Trim Savings</span></a>
    <a class="nav-item" href="admin-resummarize.html" data-page="admin-resummarize.html"><span class="icon">&#10024;</span><span>Resummarize</span></a>
    <a class="nav-item" href="admin-console.html" data-page="admin-console.html"><span class="icon">&#9888;</span><span>Console</span></a>
    <a class="nav-item" href="admin-webconsole.html" data-page="admin-webconsole.html"><span class="icon">&#127760;</span><span>Web Console</span></a>
    <div class="sidebar-label">Admin</div>
    <a class="nav-item" href="admin-reports.html" data-page="admin-reports.html"><span class="icon">&#128681;</span><span>Reports</span></a>
    <a class="nav-item" href="admin-inbox.html" data-page="admin-inbox.html"><span class="icon">&#9993;</span><span>Inbox</span></a>
    <a class="nav-item" href="admin-bugs.html" data-page="admin-bugs.html"><span class="icon">&#128027;</span><span>Bug Tracker</span></a>
    <a class="nav-item" href="admin-billing.html" data-page="admin-billing.html"><span class="icon">&#128176;</span><span>Billing</span></a>
    <a class="nav-item" href="admin-settings.html" data-page="admin-settings.html"><span class="icon">&#9881;</span><span>Settings</span></a>
    <div class="sidebar-logout"><button class="nav-item" id="logoutBtn"><span class="icon">&#128682;</span><span>Sign Out</span></button></div>
  `;
}