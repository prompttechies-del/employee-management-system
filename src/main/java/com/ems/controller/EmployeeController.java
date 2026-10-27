package com.ems.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.ems.dao.EmployeeDao;
import com.ems.model.Employee;

@Controller
@RequestMapping("/employees")
public class EmployeeController {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final EmployeeDao dao;

    public EmployeeController(EmployeeDao dao) {
        this.dao = dao;
    }

    @GetMapping
    public String list(Model model) {
        List<Employee> employees = dao.findAll();
        model.addAttribute("employees", employees);
        model.addAttribute("departmentCount",
                employees.stream().map(Employee::getDepartment).distinct().count());
        model.addAttribute("totalPayroll",
                employees.stream().map(Employee::getSalary).reduce(BigDecimal.ZERO, BigDecimal::add));
        return "list";
    }

    @GetMapping("/new")
    public String newForm(Model model) {
        model.addAttribute("employee", new Employee());
        return "form";
    }

    @PostMapping
    public String create(@ModelAttribute Employee employee, Model model) {
        List<String> errors = validate(employee);
        if (errors.isEmpty()) {
            try {
                dao.save(employee);
                return "redirect:/employees";
            } catch (DuplicateKeyException e) {
                errors.add("An employee with this email already exists.");
            }
        }
        model.addAttribute("errors", errors);
        return "form";
    }

    @GetMapping("/{id}")
    public String view(@PathVariable int id, Model model) {
        model.addAttribute("employee", dao.findById(id));
        return "view";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable int id, Model model) {
        Employee e = dao.findById(id);
        if (e == null) {
            return "redirect:/employees";
        }
        model.addAttribute("employee", e);
        return "form";
    }

    @PostMapping("/{id}")
    public String update(@PathVariable int id, @ModelAttribute Employee employee, Model model) {
        employee.setId(id);
        List<String> errors = validate(employee);
        if (errors.isEmpty()) {
            try {
                dao.update(employee);
                return "redirect:/employees/" + id;
            } catch (DuplicateKeyException e) {
                errors.add("An employee with this email already exists.");
            }
        }
        model.addAttribute("errors", errors);
        return "form";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable int id) {
        dao.delete(id);
        return "redirect:/employees";
    }

    private List<String> validate(Employee e) {
        List<String> errors = new ArrayList<>();
        if (blank(e.getName()) || e.getName().length() > 100) {
            errors.add("Name is required (max 100 characters).");
        }
        if (blank(e.getDepartment()) || e.getDepartment().length() > 100) {
            errors.add("Department is required (max 100 characters).");
        }
        if (e.getSalary() == null || e.getSalary().signum() < 0
                || e.getSalary().compareTo(new BigDecimal("9999999999")) > 0) {
            errors.add("Salary must be a number between 0 and 9,999,999,999.");
        }
        if (blank(e.getEmail()) || e.getEmail().length() > 150 || !EMAIL.matcher(e.getEmail()).matches()) {
            errors.add("A valid email is required.");
        }
        return errors;
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
