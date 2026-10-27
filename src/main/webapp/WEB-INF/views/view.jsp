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
    <title>Employee details · EMS</title>
    <link rel="stylesheet" href="${ctx}/static/css/app.css">
</head>
<body>
<header class="topbar"><div class="topbar-inner">
    <a class="brand" href="${ctx}/employees"><span class="brand-mark">E</span> Employee Manager</a>
    <form method="post" action="${ctx}/logout">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
        <button class="btn btn-sm" type="submit">Sign out</button>
    </form>
</div></header>

<main class="container">
    <a class="back" href="${ctx}/employees">← Back to employees</a>

    <c:choose>
    <c:when test="${not empty employee}">
        <section class="card" style="max-width:720px">
            <div class="detail-head">
                <span class="avatar"><c:out value="${fn:toUpperCase(fn:substring(employee.name, 0, 1))}"/></span>
                <div>
                    <h1><c:out value="${employee.name}"/></h1>
                    <span class="chip"><c:out value="${employee.department}"/></span>
                </div>
            </div>
            <div class="detail-grid">
                <div class="detail-item"><div class="detail-label">Employee ID</div><div class="detail-value">#${employee.id}</div></div>
                <div class="detail-item"><div class="detail-label">Department</div><div class="detail-value"><c:out value="${employee.department}"/></div></div>
                <div class="detail-item"><div class="detail-label">Salary</div>
                    <div class="detail-value">₹<fmt:formatNumber value="${employee.salary}" minFractionDigits="2" maxFractionDigits="2"/></div></div>
                <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value"><c:out value="${employee.email}"/></div></div>
            </div>
            <div class="detail-foot">
                <a class="btn btn-primary" href="${ctx}/employees/${employee.id}/edit">Edit</a>
                <form method="post" action="${ctx}/employees/${employee.id}/delete"
                      onsubmit="return confirm('Delete this employee permanently?');">
                    <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
                    <button class="btn btn-danger" type="submit">Delete</button>
                </form>
            </div>
        </section>
    </c:when>
    <c:otherwise>
        <section class="card"><div class="empty">
            <div class="empty-icon">🔍</div><h3>Employee not found</h3>
            <p>This record may have been deleted.</p>
            <a class="btn btn-primary" href="${ctx}/employees">Back to employees</a>
        </div></section>
    </c:otherwise>
    </c:choose>
</main>
</body>
</html>
