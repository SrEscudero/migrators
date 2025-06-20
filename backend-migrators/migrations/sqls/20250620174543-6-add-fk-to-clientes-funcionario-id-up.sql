-- VERSIÓN FINAL Y SIMPLIFICADA
ALTER TABLE Clientes ADD CONSTRAINT fk_clientes_funcionario_id FOREIGN KEY (funcionario_asignado_id) REFERENCES Usuarios(id);