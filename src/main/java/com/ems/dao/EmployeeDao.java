package com.ems.dao;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.stereotype.Repository;

import com.ems.model.Employee;

@Repository
public class EmployeeDao {

    private final JdbcTemplate jdbc;

    public EmployeeDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Employee> findAll() {
        return jdbc.query("SELECT * FROM employee ORDER BY id",
                new BeanPropertyRowMapper<>(Employee.class));
    }

    public Employee findById(int id) {
        List<Employee> result = jdbc.query("SELECT * FROM employee WHERE id = ?",
                new BeanPropertyRowMapper<>(Employee.class), id);
        return result.isEmpty() ? null : result.get(0);
    }

    public void save(Employee e) {
        jdbc.update("INSERT INTO employee (name, department, salary, email) VALUES (?, ?, ?, ?)",
                e.getName(), e.getDepartment(), e.getSalary(), e.getEmail());
    }

    public void update(Employee e) {
        jdbc.update("UPDATE employee SET name = ?, department = ?, salary = ?, email = ? WHERE id = ?",
                e.getName(), e.getDepartment(), e.getSalary(), e.getEmail(), e.getId());
    }

    public void delete(int id) {
        jdbc.update("DELETE FROM employee WHERE id = ?", id);
    }
}
