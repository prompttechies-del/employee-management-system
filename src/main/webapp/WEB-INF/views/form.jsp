<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<c:set var="isNew" value="${employee.id == 0}"/>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${isNew ? 'Add employee' : 'Edit employee'} · EMS</title>
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
    <h1>${isNew ? 'Add employee' : 'Edit employee'}</h1>
    <p class="subtitle">${isNew ? 'Enter the details of the new team member.' : 'Update this employee’s details.'}</p>

    <form class="card form-card" method="post"
          action="${ctx}/employees${isNew ? '' : '/'}${isNew ? '' : employee.id}">
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
        <c:if test="${not empty errors}">
            <div class="alert" role="alert">
                <c:forEach var="err" items="${errors}"><div><c:out value="${err}"/></div></c:forEach>
            </div>
        </c:if>
        <div class="field">
            <label for="name">Full name</label>
            <input id="name" name="name" type="text" maxlength="100" required autofocus
                   placeholder="e.g. Rahul Sharma" value="<c:out value='${employee.name}'/>">
        </div>
        <div class="field">
            <label for="department">Department</label>
            <input id="department" name="department" type="text" maxlength="100" required
                   placeholder="e.g. IT" value="<c:out value='${employee.department}'/>">
        </div>
        <div class="field">
            <label for="salary">Salary (₹ per month)</label>
            <input id="salary" name="salary" type="number" step="0.01" min="0" required
                   placeholder="30000" value="<c:out value='${employee.salary}'/>">
        </div>
        <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" maxlength="150" required
                   placeholder="name@company.com" value="<c:out value='${employee.email}'/>">
            <div class="hint">Must be unique across employees.</div>
        </div>
        <div class="form-actions">
            <button class="btn btn-primary" type="submit">${isNew ? 'Add employee' : 'Save changes'}</button>
            <a class="btn" href="${ctx}/employees">Cancel</a>
        </div>
    </form>
</main>
</body>
</html>
