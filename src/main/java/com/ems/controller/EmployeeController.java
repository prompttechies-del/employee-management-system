package com.ems.controller;

import java.math.BigDecimal;
import java.util.List;

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
    public String create(@ModelAttribute Employee employee) {
        dao.save(employee);
        return "redirect:/employees";
    }

    @GetMapping("/{id}")
    public String view(@PathVariable int id, Model model) {
        model.addAttribute("employee", dao.findById(id));
        return "view";
    }

    @GetMapping("/{id}/edit")
    public String editForm(@PathVariable int id, Model model) {
        model.addAttribute("employee", dao.findById(id));
        return "form";
    }

    @PostMapping("/{id}")
    public String update(@PathVariable int id, @ModelAttribute Employee employee) {
        employee.setId(id);
        dao.update(employee);
        return "redirect:/employees/" + id;
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable int id) {
        dao.delete(id);
        return "redirect:/employees";
    }
}
