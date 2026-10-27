<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${employee.id == 0 ? 'Add' : 'Edit'} Employee</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        label { display: block; margin-top: 12px; }
        input { width: 300px; padding: 6px; }
    </style>
</head>
<body>
    <h1>${employee.id == 0 ? 'Add' : 'Edit'} Employee</h1>

    <c:choose>
        <c:when test="${employee.id == 0}">
            <c:set var="action" value="${pageContext.request.contextPath}/employees"/>
        </c:when>
        <c:otherwise>
            <c:set var="action" value="${pageContext.request.contextPath}/employees/${employee.id}"/>
        </c:otherwise>
    </c:choose>

    <form method="post" action="${action}">
        <label>Name <input type="text" name="name" value="${employee.name}" required></label>
        <label>Department <input type="text" name="department" value="${employee.department}" required></label>
        <label>Salary <input type="number" step="0.01" min="0" name="salary" value="${employee.salary}" required></label>
        <label>Email <input type="email" name="email" value="${employee.email}" required></label>
        <p><button type="submit">Save</button>
           <a href="${pageContext.request.contextPath}/employees">Cancel</a></p>
    </form>
</body>
</html>
