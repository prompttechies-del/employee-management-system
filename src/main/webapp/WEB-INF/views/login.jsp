<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sign in · EMS</title>
    <link rel="stylesheet" href="${ctx}/static/css/app.css">
</head>
<body class="center">
<main class="login-wrap">
    <div class="brand" style="justify-content:center;margin-bottom:20px">
        <span class="brand-mark">E</span> Employee Manager
    </div>
    <form class="card form-card" method="post" action="${ctx}/login">
        <h1 style="font-size:22px">Sign in</h1>
        <p class="subtitle">Administrator access only.</p>
        <c:if test="${param.error != null}"><div class="alert" role="alert">Invalid username or password.</div></c:if>
        <c:if test="${param.logout != null}"><div class="notice">You have been signed out.</div></c:if>
        <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}">
        <div class="field">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" required autofocus>
        </div>
        <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center" type="submit">Sign in</button>
    </form>
</main>
</body>
</html>
