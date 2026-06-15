package woorifisa.project.backend.domain.exchange.client.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record KoreaEximExchangeRateItem(
    @JsonProperty("result")
    Integer result,
    @JsonProperty("cur_unit")
    String curUnit,
    @JsonProperty("cur_nm")
    String curName,
    @JsonProperty("ttb")
    String ttb,
    @JsonProperty("tts")
    String tts,
    @JsonProperty("deal_bas_r")
    String dealBaseRate,
    @JsonProperty("bkpr")
    String bkpr,
    @JsonProperty("yy_efee_r")
    String yearFeeRate,
    @JsonProperty("ten_dd_efee_r")
    String tenDayFeeRate,
    @JsonProperty("kftc_deal_bas_r")
    String kftcDealBaseRate,
    @JsonProperty("kftc_bkpr")
    String kftcBkpr
) {
}