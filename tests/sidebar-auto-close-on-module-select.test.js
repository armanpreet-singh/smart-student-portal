import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../src/${path}`, import.meta.url), "utf8");

const portals = [
  {
    name: "Student",
    sidebar: "features/dashboard/components/Sidebar/Sidebar.jsx",
    layout: "features/dashboard/layouts/DashboardLayout.jsx",
    component: "Sidebar"
  },
  {
    name: "Teacher",
    sidebar: "features/teacher/components/Sidebar/TeacherSidebar.jsx",
    layout: "features/teacher/layouts/TeacherLayout.jsx",
    component: "TeacherSidebar"
  },
  {
    name: "Admin",
    sidebar: "features/admin/components/Sidebar/AdminSidebar.jsx",
    layout: "features/admin/layouts/AdminLayout.jsx",
    component: "AdminSidebar"
  }
];

for (const portal of portals) {
  test(`${portal.name} sidebar closes when a module navigation link is selected`, async () => {
    const [sidebar, layout] = await Promise.all([
      read(portal.sidebar),
      read(portal.layout)
    ]);

    assert.match(sidebar, /onNavigate/);
    assert.match(sidebar, /event\.target\.closest\?\.\("a\.d-nav-link"\)/);
    assert.match(sidebar, /onNavigate\?\.\(\)/);
    assert.match(
      layout,
      new RegExp(`<${portal.component}[^>]*onNavigate=\\{\\(\\) => setSidebarOpen\\(false\\)\\}`)
    );
  });
}

test("module selection close is handled by the existing drawer state, not desktop layout or breakpoint CSS", async () => {
  const [dashboard, responsive] = await Promise.all([
    read("features/dashboard/styles/dashboard.css"),
    read("features/dashboard/styles/responsive.css")
  ]);

  assert.match(dashboard, /\.d-main-wrapper\s*\{[\s\S]*?margin-left:\s*280px/);
  assert.match(responsive, /@media \(max-width: 768px\)[\s\S]*?\.d-sidebar\.open\s*\{[\s\S]*?transform: translateX\(0\)/);
  assert.match(responsive, /\.d-sidebar\s*\{\s*transform: translateX\(-100%\)/);
  assert.doesNotMatch(dashboard, /sidebarOpen|onNavigate/);
  assert.doesNotMatch(responsive, /sidebarOpen|onNavigate/);
});
