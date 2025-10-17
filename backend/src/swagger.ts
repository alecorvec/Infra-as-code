import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tasks API",
      version: "1.0.0",
      description: "API de gestion des tâches avec authentification JWT",
      contact: {
        name: "API Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de développement"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Task: {
          type: "object",
          required: ["title", "content", "due_date", "request_timestamp"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Identifiant unique de la tâche"
            },
            title: {
              type: "string",
              description: "Titre de la tâche"
            },
            content: {
              type: "string",
              description: "Contenu de la tâche"
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Date d'échéance (YYYY-MM-DD)"
            },
            done: {
              type: "boolean",
              description: "Statut de la tâche"
            },
            last_request_timestamp: {
              type: "string",
              format: "date-time",
              description: "Dernier timestamp de requête"
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Date de création"
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Date de dernière modification"
            }
          }
        },
        CreateTaskRequest: {
          type: "object",
          required: ["title", "content", "due_date", "request_timestamp"],
          properties: {
            title: {
              type: "string",
              description: "Titre de la tâche"
            },
            content: {
              type: "string",
              description: "Contenu de la tâche"
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Date d'échéance (YYYY-MM-DD)"
            },
            request_timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp de la requête (ISO 8601)"
            }
          }
        },
        UpdateTaskRequest: {
          type: "object",
          required: ["request_timestamp"],
          properties: {
            title: {
              type: "string",
              description: "Titre de la tâche"
            },
            content: {
              type: "string",
              description: "Contenu de la tâche"
            },
            done: {
              type: "boolean",
              description: "Statut de la tâche"
            },
            request_timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp de la requête (ISO 8601)"
            }
          }
        },
        DeleteTaskRequest: {
          type: "object",
          required: ["request_timestamp"],
          properties: {
            request_timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp de la requête (ISO 8601)"
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Message d'erreur"
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    paths: {
      "/health": {
        get: {
          summary: "Vérifier l'état de santé de l'API",
          tags: ["Health"],
          responses: {
            "200": {
              description: "API en fonctionnement",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: {
                        type: "boolean",
                        description: "Statut de l'API"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/tasks": {
        post: {
          summary: "Créer une nouvelle tâche",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateTaskRequest"
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Tâche créée avec succès",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task"
                  }
                }
              }
            },
            "400": {
              description: "Requête invalide",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "401": {
              description: "Non autorisé",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        },
        get: {
          summary: "Récupérer toutes les tâches",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Liste des tâches récupérée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Task"
                    }
                  }
                }
              }
            },
            "401": {
              description: "Non autorisé",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        }
      },
      "/tasks/{id}": {
        get: {
          summary: "Récupérer une tâche par son ID",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
                format: "uuid"
              },
              description: "ID de la tâche"
            }
          ],
          responses: {
            "200": {
              description: "Tâche récupérée avec succès",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task"
                  }
                }
              }
            },
            "401": {
              description: "Non autorisé",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "404": {
              description: "Tâche non trouvée",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        },
        put: {
          summary: "Mettre à jour une tâche",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
                format: "uuid"
              },
              description: "ID de la tâche"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateTaskRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Tâche mise à jour avec succès",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Task"
                  }
                }
              }
            },
            "400": {
              description: "Requête invalide",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "401": {
              description: "Non autorisé",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "404": {
              description: "Tâche non trouvée",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "409": {
              description: "Timestamp de requête obsolète",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: "Supprimer une tâche",
          tags: ["Tasks"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
                format: "uuid"
              },
              description: "ID de la tâche"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteTaskRequest"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Tâche supprimée avec succès",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: {
                        type: "boolean",
                        description: "Confirmation de suppression"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Requête invalide",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "401": {
              description: "Non autorisé",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "404": {
              description: "Tâche non trouvée",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            },
            "409": {
              description: "Timestamp de requête obsolète",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJsdoc(options);
