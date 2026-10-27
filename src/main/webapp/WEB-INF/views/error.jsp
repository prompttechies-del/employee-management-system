<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Something went wrong · EMS</title>
    <link rel="stylesheet" href="${ctx}/static/css/app.css">
</head>
<body class="center">
<main class="login-wrap">
    <section class="card"><div class="empty">
        <div class="empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>The request couldn’t be completed. Please try again.</p>
        <a class="btn btn-primary" href="${ctx}/employees">Back to employees</a>
    </div></section>
</main>
</body>
</html>
