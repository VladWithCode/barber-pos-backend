import { HttpException, Injectable } from '@nestjs/common';
import { CreateWhatsappApiDto } from './dto/create-whatsapp-api.dto';
import { UpdateWhatsappApiDto } from './dto/update-whatsapp-api.dto';
import { HttpService } from '@nestjs/axios';
import {
  asyncHandler,
  dateToLongDate,
  numberToCurrency,
} from 'src/utils/helpers';
import { firstValueFrom } from 'rxjs';
import { SaleItem } from 'src/sales/entities/sale.entity';

@Injectable()
export class WhatsappApiService {
  constructor(private readonly httpService: HttpService) {}

  private async postCloudAPIMessage({
    toPhoneNumber,
    type,
    message,
    templateData,
  }: {
    toPhoneNumber: string;
    type: 'template' | 'text';
    message?: string;
    templateData?: {
      name: string;
      bodyVariables?: Record<string, any>[];
      headerVariables?: Record<string, any>[];
    };
  }) {
    const requestBody = {
      messaging_product: 'whatsapp',
      to: toPhoneNumber,
      type,
    };

    if (type === 'template') {
      const templateComponents = [];

      if (templateData.bodyVariables)
        templateComponents.push({
          type: 'body',
          parameters: templateData.bodyVariables,
        });

      if (templateData.headerVariables)
        templateComponents.push({
          type: 'header',
          parameters: templateData.headerVariables,
        });

      requestBody['template'] = {
        name: templateData.name,
        components: templateComponents,
        language: {
          code: 'es',
        },
      };
    } else {
      requestBody['message'] = message;
    }

    const [sendError, response] = await asyncHandler(
      firstValueFrom(this.httpService.post('/messages', requestBody)),
    );

    if (sendError) throw sendError.response.data;

    return response.data;
  }

  async sendMessage(message: string, phoneNumber: string) {
    const [sendError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        type: 'text',
        toPhoneNumber: phoneNumber,
        message: message,
      }),
    );

    if (sendError)
      throw {
        message: 'Ocurrio un error al enviar el mensaje',
        e: sendError,
      };

    return response.messages;
  }

  async sendPurchaseNotification(
    customerPhone: string,
    saleData: {
      items: (SaleItem & { product_name: string })[];
      total_amount: number;
      deposit: number;
      pending_amount: number;
      installment: number;
      next_payment_date: Date;
    },
  ) {
    /**
     * Variables used in the message are prefixed with `v`
     */
    const vProductCount = {
      type: 'text',
      text: saleData.items.length,
    };
    const vSaleTotal = {
      type: 'text',
      text: numberToCurrency(saleData.total_amount),
    };
    const vProductList = {
      type: 'text',
      text: saleData.items
        .map(
          (i) =>
            i.product_name +
            ': ' +
            numberToCurrency(i.sale_price) +
            ' * ' +
            i.quantity,
        )
        .join('; '),
    };
    const vDeposit = {
      type: 'text',
      text: numberToCurrency(saleData.deposit),
    };
    const vPendingAmount = {
      type: 'text',
      text: numberToCurrency(saleData.pending_amount),
    };
    const vInstallment = {
      type: 'text',
      text: numberToCurrency(saleData.installment),
    };
    const vFirstPayment = {
      type: 'text',
      text: dateToLongDate(saleData.next_payment_date),
    };

    const templateData = {
      name: 'purchase_notice',
      bodyVariables: [
        vProductCount,
        vSaleTotal,
        vProductList,
        vDeposit,
        vPendingAmount,
        vInstallment,
        vFirstPayment,
      ],
    };

    const [sendError, response] = await asyncHandler(
      this.postCloudAPIMessage({
        toPhoneNumber: '52' + customerPhone,
        type: 'template',
        templateData,
      }),
    );

    if (sendError) {
      throw new Error('Error al enviar notificación de compra');
    }

    return response.data;
  }
}
