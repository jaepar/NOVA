package woorifisa.project.coreBanking.domain.globalTransaction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.request.CreateGlobalTransactionRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.CreateGlobalTransactionResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionListItemResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionStatusResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.service.GlobalTransactionService;
import woorifisa.project.coreBanking.global.response.BaseResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/global-transactions")
public class GlobalTransactionController {

    private final GlobalTransactionService globalTransactionService;

    @PostMapping
    public BaseResponse<CreateGlobalTransactionResponse> create(
            @Valid @RequestBody CreateGlobalTransactionRequest request
    ) {
        return BaseResponse.ok(globalTransactionService.create(request));
    }

    @GetMapping("/{globalTransactionId}")
    public BaseResponse<GlobalTransactionStatusResponse> findStatus(
            @PathVariable Long globalTransactionId
    ) {
        return BaseResponse.ok(globalTransactionService.findStatus(globalTransactionId));
    }

    @GetMapping
    public BaseResponse<List<GlobalTransactionListItemResponse>> findAllByCustomer(
            @RequestParam Long customerId
    ) {
        return BaseResponse.ok(globalTransactionService.findAllByCustomer(customerId));
    }
}
