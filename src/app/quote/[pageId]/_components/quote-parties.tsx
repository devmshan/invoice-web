import { Mail, Phone, Building2, User } from "lucide-react";

interface QuotePartiesProps {
  issuerName: string;
  issuerContact: string;
  issuerEmail: string;
  clientName: string;
  clientCompany: string;
}

export function QuoteParties({
  issuerName,
  issuerContact,
  issuerEmail,
  clientName,
  clientCompany,
}: QuotePartiesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 발행자 카드 */}
      <div className="rounded-md border bg-muted/20 p-4">
        <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-widest">
          발행자
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <p className="font-semibold">{issuerName}</p>
          </div>
          {issuerContact && (
            <div className="flex items-center gap-2">
              <Phone className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground text-sm">{issuerContact}</p>
            </div>
          )}
          {issuerEmail && (
            <div className="flex items-center gap-2">
              <Mail className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground break-all text-sm">
                {issuerEmail}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 수신자 카드 */}
      <div className="rounded-md border bg-muted/20 p-4">
        <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-widest">
          수신자
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <p className="font-semibold">{clientName}</p>
          </div>
          {clientCompany && (
            <div className="flex items-center gap-2">
              <Building2 className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground text-sm">{clientCompany}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
