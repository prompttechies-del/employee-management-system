<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Employees · EMS</title>
    <link rel="stylesheet" href="${ctx}/static/css/app.css">
</head>
<body>
<header class="topbar"><div class="topbar-inner">
    <a class="brand" href="${ctx}/employees"><span class="brand-mark">E</span> Employee Manager</a>
</div></header>

<main class="container">
    <div class="header-row">
        <div>
            <h1>Employees</h1>
            <p class="subtitle">Manage your team's records in one place.</p>
        </div>
        <a class="btn btn-primary" href="${ctx}/employees/new">+ Add employee</a>
    </div>

    <section class="stats">
        <div class="stat"><div class="stat-label">Total employees</div><div class="stat-value">${fn:length(employees)}</div></div>
        <div class="stat"><div class="stat-label">Departments</div><div class="stat-value">${departmentCount}</div></div>
        <div class="stat"><div class="stat-label">Monthly payroll</div>
            <div class="stat-value">₹<fmt:formatNumber value="${totalPayroll}" maxFractionDigits="0"/></div></div>
    </section>

    <section class="card">
        <div class="toolbar">
            <input id="search" class="search" type="search" placeholder="Search by name, department or email…" aria-label="Search employees">
            <span class="count" id="count"></span>
        </div>

        <c:choose>
        <c:when test="${empty employees}">
            <div class="empty">
                <div class="empty-icon">👥</div>
                <h3>No employees yet</h3>
                <p>Add your first employee to get started.</p>
                <a class="btn btn-primary" href="${ctx}/employees/new">+ Add employee</a>
            </div>
        </c:when>
        <c:otherwise>
        <table>
            <thead><tr>
                <th>Employee</th><th>Department</th><th class="num">Salary</th><th></th>
            </tr></thead>
            <tbody id="rows">
            <c:forEach var="e" items="${employees}">
                <tr data-search="<c:out value='${fn:toLowerCase(e.name)} ${fn:toLowerCase(e.department)} ${fn:toLowerCase(e.email)}'/>">
                    <td>
                        <a class="person" href="${ctx}/employees/${e.id}">
                            <span class="avatar"><c:out value="${fn:toUpperCase(fn:substring(e.name, 0, 1))}"/></span>
                            <span>
                                <div class="person-name"><c:out value="${e.name}"/></div>
                                <div class="person-email"><c:out value="${e.email}"/></div>
                            </span>
                        </a>
                    </td>
                    <td><span class="chip"><c:out value="${e.department}"/></span></td>
                    <td class="num">₹<fmt:formatNumber value="${e.salary}" maxFractionDigits="0"/></td>
                    <td>
                        <div class="actions">
                            <a class="btn btn-sm" href="${ctx}/employees/${e.id}/edit">Edit</a>
                            <button type="button" class="btn btn-sm btn-danger"
                                    data-id="${e.id}" data-name="<c:out value='${e.name}'/>">Delete</button>
                        </div>
                    </td>
                </tr>
            </c:forEach>
            </tbody>
        </table>
        <div class="empty" id="noMatch" hidden><h3>No matches</h3><p>Try a different search.</p></div>
        </c:otherwise>
        </c:choose>
    </section>
</main>

<dialog id="confirm">
    <h3>Delete employee?</h3>
    <p id="confirmText"></p>
    <form method="post" id="deleteForm">
        <div class="dialog-actions">
            <button type="button" class="btn" id="cancel">Cancel</button>
            <button type="submit" class="btn btn-solid-danger">Delete</button>
        </div>
    </form>
</dialog>

<script>
    const rows = [...document.querySelectorAll('#rows tr')];
    const search = document.getElementById('search');
    const count = document.getElementById('count');
    const noMatch = document.getElementById('noMatch');
    function filter() {
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        rows.forEach(r => {
            const hit = r.dataset.search.includes(q);
            r.hidden = !hit;
            if (hit) shown++;
        });
        count.textContent = rows.length ? shown + ' of ' + rows.length : '';
        if (noMatch) noMatch.hidden = shown !== 0;
    }
    search.addEventListener('input', filter);
    filter();

    const dlg = document.getElementById('confirm');
    document.querySelectorAll('button[data-id]').forEach(b => b.addEventListener('click', () => {
        document.getElementById('confirmText').textContent =
            b.dataset.name + ' will be permanently removed. This can’t be undone.';
        document.getElementById('deleteForm').action = '${ctx}/employees/' + b.dataset.id + '/delete';
        dlg.showModal();
    }));
    document.getElementById('cancel').addEventListener('click', () => dlg.close());
</script>
</body>
</html>
