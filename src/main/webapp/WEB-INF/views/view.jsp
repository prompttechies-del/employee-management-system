<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Employee Details</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        td { padding: 6px 16px 6px 0; }
    </style>
</head>
<body>
    <h1>Employee Details</h1>

    <c:choose>
        <c:when test="${not empty employee}">
            <table>
                <tr><td><b>ID</b></td><td>${employee.id}</td></tr>
                <tr><td><b>Name</b></td><td>${employee.name}</td></tr>
                <tr><td><b>Department</b></td><td>${employee.department}</td></tr>
                <tr><td><b>Salary</b></td><td>${employee.salary}</td></tr>
                <tr><td><b>Email</b></td><td>${employee.email}</td></tr>
            </table>
            <p>
                <a href="${pageContext.request.contextPath}/employees/${employee.id}/edit">Edit</a> |
                <a href="${pageContext.request.contextPath}/employees">Back to list</a>
            </p>
        </c:when>
        <c:otherwise>
            <p>Employee not found.</p>
            <a href="${pageContext.request.contextPath}/employees">Back to list</a>
        </c:otherwise>
    </c:choose>
</body>
</html>
