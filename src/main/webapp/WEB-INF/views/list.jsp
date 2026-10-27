<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Employees</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        a.btn, button { padding: 4px 10px; text-decoration: none; }
    </style>
</head>
<body>
    <h1>Employee Management System</h1>
    <p><a href="${pageContext.request.contextPath}/employees/new">+ Add Employee</a></p>

    <table>
        <tr>
            <th>ID</th><th>Name</th><th>Department</th><th>Salary</th><th>Email</th><th>Actions</th>
        </tr>
        <c:forEach var="e" items="${employees}">
            <tr>
                <td>${e.id}</td>
                <td>${e.name}</td>
                <td>${e.department}</td>
                <td>${e.salary}</td>
                <td>${e.email}</td>
                <td>
                    <a href="${pageContext.request.contextPath}/employees/${e.id}">View</a> |
                    <a href="${pageContext.request.contextPath}/employees/${e.id}/edit">Edit</a> |
                    <form method="post" action="${pageContext.request.contextPath}/employees/${e.id}/delete"
                          style="display:inline" onsubmit="return confirm('Delete this employee?');">
                        <button type="submit">Delete</button>
                    </form>
                </td>
            </tr>
        </c:forEach>
        <c:if test="${empty employees}">
            <tr><td colspan="6">No employees found.</td></tr>
        </c:if>
    </table>
</body>
</html>
