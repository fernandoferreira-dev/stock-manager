// src/components/ReportSidebar.jsx
import { X, Send, AlertTriangle, FileText } from "lucide-react";
import { useState } from "react";
import "../styles/reportsSidebar.css";

export default function ReportSidebar({ isOpen, onClose, reserva, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !reserva) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const formData = new FormData(e.target);

    const report = {
      id_reserva: reserva.id_reserva,
      tipo: formData.get("tipo"),
      titulo: formData.get("titulo").trim(),
      descricao: formData.get("descricao").trim(),
    };
    if (!report.tipo || !report.titulo || !report.descricao) {
      alert("âŒ Todos os campos sÃ£o obrigatÃ³rios!");
      return;
    }

    if (report.titulo.length > 150) {
      alert("âŒ O tÃ­tulo nÃ£o pode ter mais de 150 caracteres!");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(report);
      e.target.reset();
      onClose();
    } catch (error) {
      console.error("Erro ao enviar report:", error);
      alert("âŒ Erro ao enviar report. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="report-overlay" onClick={onClose}></div>
      <div className={`report-sidebar ${isOpen ? "open" : ""}`}>
        {}
        <div className="report-header">
          <div className="report-title">
            <AlertTriangle size={22} />
            <h2>Registar Problema</h2>
          </div>
          <button className="close-btn" onClick={onClose} title="Fechar">
            <X size={22} />
          </button>
        </div>

        {}
        <div className="report-info">
          <p>
            <FileText size={16} /> Reserva <strong>#{reserva.id_reserva}</strong>
          </p>
          <p>
            <strong>Motivo:</strong> {reserva.motivo || reserva.motivo_reserva || "Sem motivo registado"}
          </p>
          {reserva.data_reserva && (
            <p>
              <strong>Data:</strong>{" "}
              {new Date(reserva.data_reserva + 'T00:00:00').toLocaleDateString("pt-PT")}
            </p>
          )}
        </div>

        {}
        <form className="report-form" onSubmit={handleSubmit}>
          <label htmlFor="tipo">Tipo de Problema: *</label>
          <select name="tipo" id="tipo" required disabled={isSubmitting}>
            <option value="">Selecione</option>
            <option value="partido">Equipamento partido</option>
            <option value="faltando">Item em falta</option>
            <option value="funcionamento">Mau funcionamento</option>
            <option value="outro">Outro</option>
          </select>

          <label htmlFor="titulo">TÃ­tulo: * <span className="char-count">(mÃ¡x. 150)</span></label>
          <input
            type="text"
            name="titulo"
            id="titulo"
            placeholder="Ex: Cabo HDMI partido"
            maxLength="150"
            required
            disabled={isSubmitting}
          />

          <label htmlFor="descricao">DescriÃ§Ã£o detalhada: *</label>
          <textarea
            name="descricao"
            id="descricao"
            placeholder="Descreva o problema em detalhe..."
            rows="5"
            required
            disabled={isSubmitting}
          />

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Enviando...
              </>
            ) : (
              <>
                <Send size={16} /> Enviar Report
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
}
