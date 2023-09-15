<?php
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

$str = $_REQUEST['string'];

if (CModule::IncludeModule("sale")){

    $arFilter1 = array(
        '%NAME_RU' => $str,
    );
    $arSelect1 = array(
        // '*',
        'ID' => 'ID',
        'REGION_ID' => 'REGION_ID',
        'NAME_RU' => 'NAME.NAME',
        'TYPE_CODE' => 'TYPE.CODE',
    );
    $res = \Bitrix\Sale\Location\LocationTable::getList(array(
        'filter' => $arFilter1,
        'select' => $arSelect1
    ));
    while ($item1 = $res->fetch()) {
        if($item1['TYPE_CODE'] == 'CITY') {
            $dbPriceType = CCatalogGroup::GetList(
                array("SORT" => "ASC"),
                array("NAME_LANG" => $item1['NAME_RU'])
            );
            if ($arPriceType = $dbPriceType->Fetch()) {
                $arCurCities[] = $item1;
            }

            //$arCurCities[] = $item1;
        };
    }
}


echo json_encode($arCurCities);