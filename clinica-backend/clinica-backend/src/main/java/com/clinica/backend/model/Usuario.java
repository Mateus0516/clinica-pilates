package com.clinica.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senhaHash;

    @Column(name = "versao_credencial")
    private Long versaoCredencial;

    @JsonIgnore
    public long getVersaoCredencial() {
        return versaoCredencial == null ? 0 : versaoCredencial;
    }

    public void trocarSenha(String novoHash) {
        senhaHash = novoHash;
        versaoCredencial = getVersaoCredencial() + 1;
    }

    private String telefone;

    private LocalDate dataNascimento;

    private String perfil = "PACIENTE";

    @Column(length = 180)
    private String endereco;
    @Column(length = 100)
    private String bairro;
    @Column(length = 100)
    private String cidade;
    @Column(length = 2)
    private String estado;
    @Column(length = 8)
    private String cep;
    private Boolean prefereEmail;
    private Boolean prefereWhatsapp;
    private Boolean preferePush;

    @JsonIgnore
    public String getEndereco() { return endereco; }
    @JsonIgnore
    public String getBairro() { return bairro; }
    @JsonIgnore
    public String getCidade() { return cidade; }
    @JsonIgnore
    public String getEstado() { return estado; }
    @JsonIgnore
    public String getCep() { return cep; }

    public void atualizarEndereco(String endereco, String bairro, String cidade, String estado, String cep) {
        this.endereco = endereco;
        this.bairro = bairro;
        this.cidade = cidade;
        this.estado = estado;
        this.cep = cep;
    }

    @JsonIgnore
    public boolean getPrefereEmail() { return !Boolean.FALSE.equals(prefereEmail); }
    @JsonIgnore
    public boolean getPrefereWhatsapp() { return !Boolean.FALSE.equals(prefereWhatsapp); }
    @JsonIgnore
    public boolean getPreferePush() { return !Boolean.FALSE.equals(preferePush); }

    public void atualizarPreferencias(boolean email, boolean whatsapp, boolean push) {
        prefereEmail = email;
        prefereWhatsapp = whatsapp;
        preferePush = push;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonIgnore
    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }
}